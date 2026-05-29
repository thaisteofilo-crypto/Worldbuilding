"use client"

import React, { useRef } from "react"
import { useEditMode } from "./use-edit-mode"
import { EditableText } from "./editable-text"

interface EditableCardProps {
  cardKey: string
  title: string
  titleKey?: string
  kicker?: string
  href: string
  published: boolean
  onTogglePublish: () => void
  onSave: (key: string, value: string) => Promise<void>
  onImageUpload?: (file: File) => Promise<void>
  children: React.ReactNode
}

export function EditableCard({
  cardKey,
  title,
  titleKey,
  kicker,
  href,
  published,
  onTogglePublish,
  onSave,
  onImageUpload,
  children,
}: EditableCardProps) {
  const { isEditing } = useEditMode()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className="relative shrink-0 rounded-xl overflow-hidden"
      style={{
        width: 160,
        opacity: published ? 1 : 0.45,
        outline: isEditing ? "1.5px solid oklch(0.7 0.2 290 / 0.5)" : undefined,
      }}
    >
      {children}

      {isEditing && (
        <div
          className="absolute top-1.5 right-1.5 z-30 flex flex-col gap-1"
        >
          {/* Publish toggle */}
          <button
            type="button"
            onClick={onTogglePublish}
            title={published ? "Despublicar" : "Publicar"}
            className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors"
            style={{
              background: published
                ? "oklch(0.55 0.18 145)"
                : "oklch(0.35 0.05 260)",
              color: "white",
              border: "1px solid oklch(1 0 0 / 0.25)",
            }}
          >
            {published ? "✓" : "✗"}
          </button>

          {/* Image upload */}
          {onImageUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onImageUpload(file)
                  e.target.value = ""
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Trocar imagem"
                className="flex items-center justify-center w-6 h-6 rounded-full text-xs transition-colors"
                style={{
                  background: "oklch(0 0 0 / 0.55)",
                  color: "white",
                  border: "1px solid oklch(1 0 0 / 0.25)",
                }}
              >
                ↑
              </button>
            </>
          )}
        </div>
      )}

      {/* Editable title overlay (edit mode only, shown below card) */}
      {isEditing && titleKey && (
        <div className="px-2 py-1" style={{ background: "oklch(0.08 0 0 / 0.9)" }}>
          <EditableText
            value={title}
            contentKey={titleKey}
            onSave={onSave}
            as="span"
            className="text-xs font-sans text-white/70 block w-full"
          />
        </div>
      )}
    </div>
  )
}
