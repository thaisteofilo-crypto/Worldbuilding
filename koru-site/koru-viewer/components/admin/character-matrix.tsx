"use client"

interface Props {
  charMentions: Record<string, Record<string, number>>
  chapters: Array<{ slug: string; title: string; words: number }>
}

const CHARACTER_ORDER = ["temiku", "amara", "oruku", "beku", "obaru", "kemdi", "orike", "temi", "kairo"]

function toColumnLabel(slug: string): string {
  if (slug === "epilogo") return "Ep"
  const n = parseInt(slug, 10)
  if (!isNaN(n)) return String(n)
  return slug
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function intensityColor(count: number, max: number): string {
  if (count === 0 || max === 0) return "transparent"
  const ratio = count / max
  const pct = Math.round(Math.min(ratio * 80 + 15, 95))
  return `color-mix(in oklch, var(--accent) ${pct}%, transparent)`
}

const LEGEND_ITEMS: Array<{ label: string; pct: number }> = [
  { label: "1–3", pct: 20 },
  { label: "4–10", pct: 50 },
  { label: ">10", pct: 90 },
]

export function CharacterMatrix({ charMentions, chapters }: Props) {
  const activeChapters = chapters.filter((c) => c.words > 0)

  const rowMaxes: Record<string, number> = {}
  for (const char of CHARACTER_ORDER) {
    let max = 0
    for (const ch of activeChapters) {
      const count = charMentions[ch.slug]?.[char] ?? 0
      if (count > max) max = count
    }
    rowMaxes[char] = max
  }

  return (
    <section className="glass-card rounded-xl overflow-hidden" aria-labelledby="char-matrix-heading">
      <div className="px-5 pt-5 pb-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] shrink-0"
            style={{
              background: "color-mix(in oklch, var(--accent) 12%, transparent)",
              color: "var(--accent)",
            }}
          >
            Personagens
          </span>
          <h2
            id="char-matrix-heading"
            className="font-serif text-xl leading-tight"
            style={{ color: "var(--foreground)" }}
          >
            Presença nos capítulos
          </h2>
        </div>
        <p className="font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
          menções por nome nos capítulos com conteúdo
        </p>
      </div>

      <div className="px-5 pb-2 overflow-x-auto">
        <table
          className="text-[11px] border-collapse"
          style={{ borderColor: "var(--border)" }}
        >
          <thead>
            <tr>
              <th
                className="sticky left-0 z-10 min-w-[80px] h-9 px-2 text-left font-sans text-[10px] uppercase tracking-[0.12em] align-middle"
                style={{
                  color: "var(--muted-foreground)",
                  background: "var(--card, var(--surface))",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                Personagem
              </th>
              {activeChapters.map((ch) => (
                <th
                  key={ch.slug}
                  className="min-w-[36px] h-9 px-1 text-center font-sans text-[10px] align-middle font-normal"
                  style={{
                    color: "var(--muted-foreground)",
                    borderBottom: "1px solid var(--border)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {toColumnLabel(ch.slug)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CHARACTER_ORDER.map((char, rowIdx) => {
              const max = rowMaxes[char]
              const isLast = rowIdx === CHARACTER_ORDER.length - 1
              return (
                <tr key={char}>
                  <td
                    className="sticky left-0 z-10 min-w-[80px] h-9 px-2 font-sans align-middle"
                    style={{
                      color: "var(--foreground)",
                      background: "var(--card, var(--surface))",
                      borderBottom: isLast ? "none" : "1px solid color-mix(in oklch, var(--border) 50%, transparent)",
                    }}
                  >
                    {capitalize(char)}
                  </td>
                  {activeChapters.map((ch) => {
                    const count = charMentions[ch.slug]?.[char] ?? 0
                    const bg = intensityColor(count, max)
                    return (
                      <td
                        key={ch.slug}
                        className="min-w-[36px] h-9 text-center align-middle"
                        style={{
                          background: bg,
                          borderBottom: isLast ? "none" : "1px solid color-mix(in oklch, var(--border) 50%, transparent)",
                          borderLeft: "1px solid color-mix(in oklch, var(--border) 30%, transparent)",
                        }}
                        title={count > 0 ? `${capitalize(char)} — cap. ${ch.slug}: ${count} menção${count !== 1 ? "ões" : ""}` : undefined}
                      >
                        {count > 0 && (
                          <span className="font-serif" style={{ color: "var(--foreground)" }}>
                            {count}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 flex items-center gap-4">
        <span
          className="font-sans text-[10px] uppercase tracking-[0.12em]"
          style={{ color: "var(--muted-foreground)" }}
        >
          Intensidade
        </span>
        <div className="flex items-center gap-3">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="rounded-sm shrink-0"
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: `color-mix(in oklch, var(--accent) ${item.pct}%, transparent)`,
                  border: "1px solid color-mix(in oklch, var(--accent) 40%, transparent)",
                }}
              />
              <span className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
