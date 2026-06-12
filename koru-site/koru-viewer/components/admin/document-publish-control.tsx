"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { PublishConfig, PublishState } from "@/lib/document-publish"

interface Props {
  value: PublishConfig
  onChange: (next: PublishConfig) => void
  size?: "sm" | "md"
  showLabel?: boolean
}

interface Coords { top: number; left: number }

interface StateOption {
  id: PublishState
  label: string
  short: string
  description: string
  // OKLCH colors aligned with the editorial palette already used by status badges.
  color: string
  dotColor: string
}

const STATE_OPTIONS: StateOption[] = [
  {
    id: "published",
    label: "Publicado",
    short: "Pub",
    description: "Visível agora pra qualquer visitante.",
    color: "oklch(0.70 0.09 155)",
    dotColor: "oklch(0.64 0.10 155)",
  },
  {
    id: "scheduled",
    label: "Agendado",
    short: "Sched",
    description: "Aparece automaticamente na data marcada.",
    color: "oklch(0.72 0.08 75)",
    dotColor: "oklch(0.66 0.10 72)",
  },
  {
    id: "draft",
    label: "Rascunho",
    short: "Drft",
    description: "Oculto — card aparece com cadeado, página não abre.",
    color: "oklch(0.58 0.01 280)",
    dotColor: "oklch(0.50 0.01 280)",
  },
]

const STATE_BY_ID: Record<PublishState, StateOption> = Object.fromEntries(
  STATE_OPTIONS.map((s) => [s.id, s]),
) as Record<PublishState, StateOption>

// Format an ISO datetime for the <input type="datetime-local"> control.
// Strips seconds + timezone — the input expects "YYYY-MM-DDTHH:mm" in local time.
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    d.getFullYear() +
    "-" + pad(d.getMonth() + 1) +
    "-" + pad(d.getDate()) +
    "T" + pad(d.getHours()) +
    ":" + pad(d.getMinutes())
  )
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null
  const d = new Date(value)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

export function DocumentPublishControl({ value, onChange, size = "sm", showLabel = false }: Props) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<Coords | null>(null)
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const def = STATE_BY_ID[value.state] ?? STATE_BY_ID.published

  useEffect(() => setMounted(true), [])

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return
    function place() {
      const btn = btnRef.current
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      const menuWidth = 260
      const menuHeight = 320
      const margin = 8
      let top = rect.bottom + 4
      let left = rect.right - menuWidth
      if (top + menuHeight > window.innerHeight - margin) {
        top = Math.max(margin, rect.top - menuHeight - 4)
      }
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

  const iconSize = size === "sm" ? 13 : 15
  const labelColor = def.color
  const dotColor = def.dotColor

  // Distinct icon per state — so this control is visually different from
  // the round-dot status badge that lives next to it on each row.
  function StateIcon({ state, size: s }: { state: PublishState; size: number }) {
    if (state === "published") {
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      )
    }
    if (state === "scheduled") {
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
      )
    }
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    )
  }

  function setState(next: PublishState) {
    if (next === "scheduled") {
      // Default the schedule datetime to "now + 1 day" so the input has something to show.
      const fallback = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      onChange({ state: "scheduled", at: value.at ?? fallback })
    } else {
      onChange({ state: next, at: null })
    }
  }

  const menu = open && coords && mounted ? createPortal(
    <div
      ref={menuRef}
      className="rounded-lg overflow-hidden"
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        width: 260,
        zIndex: 100,
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "0 12px 36px oklch(0 0 0 / 0.35)",
      }}
      role="menu"
    >
      <ul className="flex flex-col py-1">
        {STATE_OPTIONS.map((s) => {
          const active = s.id === value.state
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setState(s.id)
                  if (s.id !== "scheduled") setOpen(false)
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
                  className="shrink-0 inline-flex items-center justify-center"
                  style={{ width: 14, height: 14, color: s.color, marginTop: 2 }}
                  aria-hidden
                >
                  <StateIcon state={s.id} size={14} />
                </span>
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
        {value.state === "scheduled" && (
          <li className="px-3 py-2 border-t" style={{ borderColor: "var(--border)" }}>
            <label className="block font-sans text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--muted-foreground)" }}>
              Liberar em
            </label>
            <input
              type="datetime-local"
              value={toDatetimeLocal(value.at)}
              onChange={(e) => {
                const iso = fromDatetimeLocal(e.target.value)
                onChange({ state: "scheduled", at: iso })
              }}
              className="w-full rounded px-2 py-1 font-sans text-xs"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </li>
        )}
      </ul>
    </div>,
    document.body,
  ) : null

  // Compact title — shows state, plus the scheduled date when relevant.
  const compactTitle = (() => {
    if (value.state === "scheduled" && value.at) {
      const d = new Date(value.at)
      if (!isNaN(d.getTime())) {
        return def.label + " — libera " + d.toLocaleString("pt-BR", {
          day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
        })
      }
    }
    return def.label + " — " + def.description
  })()

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
        className="inline-flex items-center justify-center rounded-md transition-all"
        style={{
          padding: "4px 6px",
          background: "color-mix(in oklch, " + def.color + " 12%, transparent)",
          border: "1px solid color-mix(in oklch, " + def.color + " 30%, transparent)",
          color: labelColor,
          gap: 5,
        }}
        title={compactTitle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={"Publicação: " + def.label}
      >
        <span className="shrink-0 inline-flex" style={{ color: dotColor }}>
          <StateIcon state={value.state} size={iconSize} />
        </span>
        <span
          className={
            "font-sans uppercase whitespace-nowrap transition-all duration-150 " +
            (showLabel
              ? "max-w-[80px] opacity-90"
              : "max-w-0 opacity-0 overflow-hidden group-hover:max-w-[80px] group-hover:opacity-70")
          }
          style={{ fontSize: 9, letterSpacing: "0.12em", fontWeight: 500 }}
        >
          {def.short}
        </span>
      </button>
      {menu}
    </>
  )
}
