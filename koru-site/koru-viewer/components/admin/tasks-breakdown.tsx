"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress"

interface Props {
  taskStats: {
    total: number
    todo: number
    inProgress: number
    done: number
    highPriority: number
    byCategory: Record<string, number>
  }
}

export function TasksBreakdown({ taskStats }: Props) {
  const { todo, inProgress, done, highPriority, byCategory } = taskStats

  const categoryEntries = Object.entries(byCategory)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  const maxCount = categoryEntries.length > 0 ? categoryEntries[0][1] : 1

  const pills = [
    { label: "Todo", value: todo, color: "var(--muted-foreground)" },
    { label: "Em progresso", value: inProgress, color: "var(--gold)" },
    { label: "Feitas", value: done, color: "var(--accent)" },
  ]

  return (
    <GlassCard variant="frosted" className="p-5" aria-labelledby="tasks-breakdown-heading" role="region">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-sans text-[10px] uppercase tracking-[0.15em] shrink-0">
            Tarefas
          </Badge>
          <h2
            id="tasks-breakdown-heading"
            className="font-serif text-xl leading-tight"
            style={{ color: "var(--foreground)" }}
          >
            Tarefas em aberto
          </h2>
        </div>
        {highPriority > 0 && (
          <Badge variant="destructive" className="shrink-0 whitespace-nowrap font-sans text-[10px]">
            {highPriority} alta prioridade
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {pills.map(({ label, value, color }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs"
            style={{
              background: "color-mix(in oklch, " + color + " 10%, transparent)",
              border: "1px solid color-mix(in oklch, " + color + " 25%, transparent)",
              color,
            }}
          >
            <span className="font-serif text-sm leading-none">{value}</span>
            {label}
          </span>
        ))}
      </div>

      {categoryEntries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categoryEntries.map(([category, count]) => {
            const barValue = Math.round((count / maxCount) * 100)
            const label = category.charAt(0).toUpperCase() + category.slice(1)
            return (
              <div
                key={category}
                className="rounded-lg px-3 py-2.5"
                style={{
                  background: "color-mix(in oklch, var(--foreground) 4%, transparent)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-baseline justify-between gap-1 mb-2">
                  <span
                    className="font-sans text-[10px] uppercase tracking-[0.1em] truncate"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {label}
                  </span>
                  <span
                    className="font-serif text-xl leading-none shrink-0"
                    style={{ color: "var(--foreground)" }}
                  >
                    {count}
                  </span>
                </div>
                <Progress value={barValue} aria-label={`${label}: ${count}`} className="w-full">
                  <ProgressTrack className="h-1">
                    <ProgressIndicator />
                  </ProgressTrack>
                </Progress>
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}
