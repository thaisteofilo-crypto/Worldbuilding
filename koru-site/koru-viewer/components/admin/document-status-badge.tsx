"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  DOCUMENT_STATUSES,
  DocumentStatus,
  getStatusDef,
} from "@/lib/document-status"

interface Props {
  value: DocumentStatus | null | undefined
  onChange: (next: DocumentStatus | null) => void
  size?: "sm" | "md"
  compact?: boolean
  /** show the short label inline next to the dot (compact mode only); for hover/selected rows */
  showLabel?: boolean
}

interface Coords { top: number; left: number }

export function DocumentStatusBadge({ value, onChange, size = "sm", compact = false, showLabel = false }: Props) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<Coords | null>(null)
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const def = getStatusDef(value)

  useEffect(() => setMounted(true), [])

  // Position the menu relative to the button, respecting viewport edges
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return

    function place() {
      const btn = btnRef.current
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      const menuWidth = 240
      const menuHeight = 280 // approx
      const margin = 8

      // Prefer below, anchor right edge to button right
      let top = rect.bottom + 4
      let left = rect.right - menuWidth

      // If not enough space below, flip above
      if (top + menuHeight > window.innerHeight - margin) {
        top = Math.max(margin, rect.top - menuHeight - 4)
      }

      // Clamp horizontally
      if (left < margin) left = margin
      if (left + menuWidth > window.innerWidth - margin) {
        left = window.innerWidth - menuWidth - margin
      }

      setCoords({ top, left })
    }

    place()
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    return () => {
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
    }
  }, [open])

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (menuRef.current?.contains(target)) return
      if (btnRef.current?.contains(target)) return
      setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("mousedown", handleClick)
    window.addEventListener("keydown", handleKey)
    return () => {
      window.removeEventListener("mousedown", handleClick)
      window.removeEventListener("keydown", handleKey)
    }
  }, [open])

  const dotSize = size === "sm" ? 6 : 8
  const fullLabel = def?.label ?? "Sem status"
  const shortLabel = def?.short ?? ""
  const labelColor = def?.color ?? "var(--muted-foreground)"
  const dotColor = def?.dotColor ?? "var(--border)"

  // SVG icon per status — 16×16, used inside the compact button
  function StatusIcon({ status }: { status: string | null | undefined }) {
    if (status === "rascunho") {
      // PencilLine
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
        </svg>
      )
    }
    if (status === "aprimorar") {
      // Sparkles
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.07l-4.91 3.57a1 1 0 0 0-.36 1.12L17.41 20 12 16.43 6.59 20l1.88-5.86a1 1 0 0 0-.36-1.12L3.1 9.45h6.07a1 1 0 0 0 .95-.69L12 3z"/>
          <path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>
        </svg>
      )
    }
    if (status === "revisar") {
      // Eye
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )
    }
    if (status === "completo") {
      // CheckCircle
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      )
    }
    if (status === "arquivar") {
      // Archive
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="21 8 21 21 3 21 3 8"/>
          <rect x="1" y="3" width="22" height="5"/>
          <line x1="10" y1="12" x2="14" y2="12"/>
        </svg>
      )
    }
    // No status — CircleDashed
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="9" strokeDasharray="4 2"/>
      </svg>
    )
  }

  const menu = open && coords && mounted ? createPortal(
    <div
      ref={menuRef}
      className="rounded-lg overflow-hidden"
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        width: 240,
        zIndex: 100,
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "0 12px 36px oklch(0 0 0 / 0.35)",
      }}
      role="menu"
    >
      <ul className="flex flex-col py-1">
        {DOCUMENT_STATUSES.map((s) => {
          const active = s.id === value
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(s.id)
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2 transition-colors flex items-start gap-2.5"
                style={{
                  background: active ? "color-mix(in oklch, " + s.color + " 12%, transparent)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "color-mix(in oklch, var(--foreground) 5%, transparent)"
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent"
                }}
                role="menuitem"
              >
                <span
                  className="rounded-full shrink-0"
                  style={{ width: 8, height: 8, background: s.dotColor, marginTop: 5 }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-sans text-xs font-medium" style={{ color: "var(--foreground)" }}>
                    {s.label}
                  </span>
                  <span className="block font-sans text-[10px] leading-tight mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {s.description}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
        {value && (
          <>
            <li><div style={{ height: 1, margin: "4px 10px", background: "var(--border)" }} /></li>
            <li>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(null)
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2 transition-colors font-sans text-xs"
                style={{ color: "var(--muted-foreground)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "color-mix(in oklch, var(--foreground) 5%, transparent)" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
                role="menuitem"
              >
                Remover status
              </button>
            </li>
          </>
        )}
      </ul>
    </div>,
    document.body
  ) : null

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setOpen((v) => !v)
        }}
        className={compact ? "inline-flex items-center justify-center rounded-full transition-all w-5 h-5" : "inline-flex items-center justify-center rounded-full transition-all"}
        style={compact ? {
          // Compact mode: ícone fixo 20×20, sem pill/border/bg.
          padding: 2,
          background: "transparent",
          border: "none",
          color: def ? labelColor : "var(--muted-foreground)",
          opacity: def ? 1 : 0.35,
        } : {
          // Full mode: pill tradicional (usado em cards/dropdowns).
          padding: "3px 9px",
          background: def ? "color-mix(in oklch, " + def.color + " 14%, transparent)" : "transparent",
          border: def ? "1px solid color-mix(in oklch, " + def.color + " 30%, transparent)" : "1px dashed color-mix(in oklch, var(--border) 70%, transparent)",
          color: labelColor,
          fontSize: 10,
          lineHeight: 1,
          letterSpacing: "0.06em",
          opacity: def ? 1 : 0.55,
          gap: 6,
        }}
        title={def ? def.label + " — " + def.description : "Definir status"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={def ? "Status: " + def.label : "Sem status — definir"}
      >
        {compact ? (
          <StatusIcon status={value} />
        ) : (
          <>
            <span
              className="rounded-full shrink-0"
              style={{
                width: dotSize,
                height: dotSize,
                background: def ? dotColor : "transparent",
                border: def ? "none" : "1px dashed color-mix(in oklch, var(--muted-foreground) 55%, transparent)",
                boxShadow: def ? "0 0 0 3px color-mix(in oklch, " + def.color + " 16%, transparent)" : "none",
              }}
              aria-hidden
            />
            <span className="font-sans uppercase tracking-[0.08em] whitespace-nowrap">{fullLabel}</span>
          </>
        )}
      </button>
      {menu}
    </>
  )
}
