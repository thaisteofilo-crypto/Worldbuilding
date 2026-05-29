"use client"

import React, { useState, useRef, useEffect } from "react"
import { useEditMode } from "./use-edit-mode"

type AsProp = "p" | "h1" | "h2" | "h3" | "h4" | "span"

interface EditableTextProps {
  value: string
  /** Key used when onSave receives (key, value) — provide either this or a callback-only onSave */
  contentKey?: string
  onSave: ((key: string, value: string) => Promise<void>) | ((value: string) => Promise<void>)
  as?: AsProp
  className?: string
  style?: React.CSSProperties
}

export function EditableText({
  value,
  contentKey,
  onSave,
  as: Tag = "p",
  className,
  style,
}: EditableTextProps) {
  const { isEditing } = useEditMode()
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  if (!isEditing) {
    return (
      <Tag className={className} style={style}>
        {value || " "}
      </Tag>
    )
  }

  async function handleBlur() {
    if (draft === value) return
    setSaving(true)
    try {
      if (contentKey) {
        await (onSave as (key: string, value: string) => Promise<void>)(contentKey, draft)
      } else {
        await (onSave as (value: string) => Promise<void>)(draft)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <textarea
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      rows={2}
      className={className}
      style={{
        ...style,
        background: "oklch(0 0 0 / 0.35)",
        border: "1px solid oklch(1 0 0 / 0.3)",
        borderRadius: 4,
        padding: "2px 6px",
        width: "100%",
        resize: "vertical",
        opacity: saving ? 0.6 : 1,
        fontFamily: "inherit",
        fontSize: "inherit",
        fontWeight: "inherit",
        lineHeight: "inherit",
        letterSpacing: "inherit",
        color: "inherit",
      }}
    />
  )
}
