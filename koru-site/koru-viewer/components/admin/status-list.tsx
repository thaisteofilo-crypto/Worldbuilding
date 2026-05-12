"use client"

import { useState } from "react"

interface Props {
  statusByDoc: Record<string, string>
  counts: Record<string, number>
}

const STATUS_ORDER = ["completo", "revisar", "aprimorar", "rascunho", "arquivar"] as const

const STATUS_META: Record<string, { label: string; color: string }> = {
  rascunho:  { label: "Rascunho",  color: "oklch(0.65 0.08 240)" },
  aprimorar: { label: "Aprimorar", color: "oklch(0.72 0.12 55)"  },
  revisar:   { label: "Revisar",   color: "oklch(0.68 0.15 290)" },
  completo:  { label: "Completo",  color: "oklch(0.65 0.12 145)" },
  arquivar:  { label: "Arquivar",  color: "oklch(0.50 0.02 280)" },
}

function formatDocPath(path: string): string {
  const livroChap = path.match(/livro\/capitulo-(\d+)(?:\.md)?$/)
  if (livroChap) return "Capítulo " + livroChap[1]

  if (/livro\/epilogo(?:\.md)?$/.test(path)) return "Epílogo"

  const conto = path.match(/contos\/conto-([^./]+)(?:\.md)?$/)
  if (conto) {
    const name = conto[1].charAt(0).toUpperCase() + conto[1].slice(1)
    return "Conto — " + name
  }

  const biblia = path.match(/biblia\/parte-(\d+)(?:\.md)?$/)
  if (biblia) return "Bíblia — Parte " + biblia[1]

  const personagem = path.match(/personagens\/([^./]+)(?:\.md)?$/)
  if (personagem) {
    const name = personagem[1].charAt(0).toUpperCase() + personagem[1].slice(1)
    return "Personagem — " + name
  }

  const base = path.split("/").pop()?.replace(/\.md$/, "") ?? path
  return base.charAt(0).toUpperCase() + base.slice(1)
}

export function StatusList({ statusByDoc, counts }: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["completo"]))

  function toggle(status: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  const docsByStatus: Record<string, string[]> = {}
  for (const [path, status] of Object.entries(statusByDoc)) {
    if (!docsByStatus[status]) docsByStatus[status] = []
    docsByStatus[status].push(path)
  }

  const visibleStatuses = STATUS_ORDER.filter((s) => (counts[s] ?? 0) > 0)

  return (
    <section className="glass-card rounded-xl overflow-hidden" aria-labelledby="status-list-heading">
      <div className="px-5 pt-5 pb-4 flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] shrink-0"
          style={{
            background: "color-mix(in oklch, var(--foreground) 7%, transparent)",
            color: "var(--muted-foreground)",
          }}
        >
          Status
        </span>
        <h2
          id="status-list-heading"
          className="font-serif text-xl leading-tight"
          style={{ color: "var(--foreground)" }}
        >
          Documentos por status
        </h2>
      </div>

      <div className="flex flex-col">
        {visibleStatuses.map((status) => {
          const meta = STATUS_META[status]
          const count = counts[status] ?? 0
          const docs = docsByStatus[status] ?? []
          const isOpen = openSections.has(status)

          return (
            <div
              key={status}
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <button
                type="button"
                onClick={() => toggle(status)}
                className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left"
                style={{
                  background: isOpen
                    ? "color-mix(in oklch, " + meta.color + " 7%, transparent)"
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isOpen) e.currentTarget.style.background = "color-mix(in oklch, var(--foreground) 4%, transparent)"
                }}
                onMouseLeave={(e) => {
                  if (!isOpen) e.currentTarget.style.background = "transparent"
                }}
                aria-expanded={isOpen}
              >
                <span
                  className="rounded-full shrink-0"
                  style={{ width: 8, height: 8, background: meta.color }}
                  aria-hidden
                />
                <span
                  className="font-sans text-xs uppercase tracking-[0.12em] flex-1"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[10px] shrink-0"
                  style={{
                    background: "color-mix(in oklch, " + meta.color + " 14%, transparent)",
                    color: meta.color,
                  }}
                >
                  {count}
                </span>
                <svg
                  aria-hidden
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: "var(--muted-foreground)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 200ms",
                    flexShrink: 0,
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && docs.length > 0 && (
                <div className="px-5 pb-4 pt-1 flex flex-wrap gap-1.5">
                  {docs.map((path) => (
                    <span
                      key={path}
                      className="inline-flex items-center rounded-full px-2.5 py-1 font-sans text-[11px]"
                      style={{
                        background: "color-mix(in oklch, " + meta.color + " 10%, transparent)",
                        border: "1px solid color-mix(in oklch, " + meta.color + " 22%, transparent)",
                        color: "var(--foreground)",
                      }}
                    >
                      {formatDocPath(path)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
