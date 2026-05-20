"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { DOCUMENT_STATUSES, DocumentStatus } from "@/lib/document-status"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"

interface Props {
  counts: Record<DocumentStatus, number>
  totalTracked: number
  withoutStatus: number
}

export function StatusProgressCard({ counts, totalTracked, withoutStatus }: Props) {
  const totalClassified = totalTracked - withoutStatus
  const classifiedPercent = totalTracked > 0 ? Math.round((totalClassified / totalTracked) * 100) : 0

  // Visual bar segments (ordered by DOCUMENT_STATUSES)
  const segments = DOCUMENT_STATUSES.map((s) => ({
    ...s,
    count: counts[s.id] ?? 0,
    width: totalTracked > 0 ? ((counts[s.id] ?? 0) / totalTracked) * 100 : 0,
  }))

  return (
    <GlassCard variant="frosted" className="overflow-hidden" aria-labelledby="status-docs-heading" role="region">
      <div className="px-5 pt-5 pb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div className="min-w-0 md:flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] shrink-0"
                style={{
                  background: "color-mix(in oklch, var(--foreground) 7%, transparent)",
                  color: "var(--muted-foreground)",
                }}
              >
                Progresso
              </span>
              <h2 id="status-docs-heading" className="font-serif text-xl leading-tight" style={{ color: "var(--foreground)" }}>
                Status dos documentos
              </h2>
            </div>
            <p className="font-sans text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {classifiedPercent}% dos {totalTracked} documentos têm status definido.
              {withoutStatus > 0 && ` ${withoutStatus} sem classificação.`}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="rounded-full gap-1.5 shrink-0">
            <Link href="/admin/editor">
              Ir para o editor
              <ChevronRight size={11} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stacked progress bar */}
      <div className="px-5 pb-3">
        <div
          className="w-full h-2 rounded-full overflow-hidden flex"
          style={{ background: "color-mix(in oklch, var(--foreground) 6%, transparent)" }}
          role="img"
          aria-label={`Progresso: ${classifiedPercent}% dos ${totalTracked} documentos classificados`}
        >
          {segments.map((s) => s.count > 0 && (
            <div
              key={s.id}
              style={{ width: `${s.width}%`, background: s.dotColor }}
              title={`${s.label}: ${s.count}`}
            />
          ))}
        </div>
      </div>

      {/* Status legend grid */}
      <div className="px-5 pb-5 pt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {DOCUMENT_STATUSES.map((s) => {
          const count = counts[s.id] ?? 0
          return (
            <div
              key={s.id}
              className="rounded-lg px-3 py-2.5"
              style={{
                background: count > 0
                  ? "color-mix(in oklch, " + s.color + " 10%, transparent)"
                  : "transparent",
                border: "1px solid " + (count > 0
                  ? "color-mix(in oklch, " + s.color + " 25%, transparent)"
                  : "var(--border)"),
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  aria-hidden="true"
                  className="rounded-full shrink-0"
                  style={{ width: 7, height: 7, background: s.dotColor }}
                />
                <span
                  className="font-sans text-[10px] uppercase tracking-[0.1em] truncate"
                  style={{ color: count > 0 ? s.color : "var(--muted-foreground)" }}
                >
                  {s.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="font-serif text-2xl leading-none"
                  style={{ color: count > 0 ? "var(--foreground)" : "var(--muted-foreground)", opacity: count > 0 ? 1 : 0.4 }}
                >
                  {count}
                </span>
                <span className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                  {count === 1 ? "doc" : "docs"}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
