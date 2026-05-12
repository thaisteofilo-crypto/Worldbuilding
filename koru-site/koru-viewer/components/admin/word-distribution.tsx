"use client"

interface Props {
  chapters: Array<{ slug: string; title: string; words: number; tensionScore: number }>
  contoWordCounts: Record<string, number>
  bibliaWordCounts: Record<string, number>
  mainBibleWords: number
  sectionWords: { biblia: number; livro: number; contos: number }
}

function formatWords(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k"
  return String(n)
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/^Cap[íi]tulo\s+\w+\s*[—\-–]\s*/i, "")
  return clean.length > max ? clean.slice(0, max) + "…" : clean
}

function TensionDot({ score }: { score: number }) {
  const color =
    score > 15
      ? "oklch(0.55 0.18 25)"
      : score >= 8
      ? "var(--gold)"
      : "var(--blue-cold)"
  return (
    <span
      aria-hidden="true"
      title={`tensão: ${score}`}
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  )
}

interface BarRowProps {
  label: string
  words: number
  maxWords: number
  barColor: string
  extra?: React.ReactNode
}

function BarRow({ label, words, maxWords, barColor, extra }: BarRowProps) {
  const pct = maxWords > 0 ? (words / maxWords) * 100 : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span
          className="font-sans text-[11px] truncate"
          style={{ color: "var(--foreground)", maxWidth: "60%" }}
        >
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {extra}
          <span
            className="font-sans text-[11px] tabular-nums"
            style={{ color: "var(--muted-foreground)" }}
          >
            {formatWords(words)}
          </span>
        </div>
      </div>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height: 6,
          background: "color-mix(in oklch, var(--foreground) 6%, transparent)",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: barColor,
            borderRadius: "9999px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  )
}

const CONTO_ORDER = ["amara", "oruku", "beku", "obaru", "kemdi", "temi", "orike", "temiku", "kairo"]

export function WordDistribution({
  chapters,
  contoWordCounts,
  bibliaWordCounts,
  mainBibleWords,
  sectionWords,
}: Props) {
  const activeChapters = chapters.filter((ch) => ch.words > 0)
  const maxChapterWords = activeChapters.reduce((m, ch) => Math.max(m, ch.words), 0)

  const activeContos = CONTO_ORDER.filter(
    (slug) => (contoWordCounts[slug] ?? 0) > 0
  )
  const maxContoWords = activeContos.reduce(
    (m, slug) => Math.max(m, contoWordCounts[slug] ?? 0),
    0
  )

  const bibliaEntries: Array<{ label: string; words: number }> = []
  for (let i = 0; i <= 8; i++) {
    const key = `parte-${String(i).padStart(2, "0")}`
    const w = bibliaWordCounts[key] ?? 0
    if (w > 0) bibliaEntries.push({ label: `Parte ${String(i).padStart(2, "0")}`, words: w })
  }
  if (mainBibleWords > 0) {
    bibliaEntries.unshift({ label: "Índice", words: mainBibleWords })
  }
  const maxBibliaWords = bibliaEntries.reduce((m, e) => Math.max(m, e.words), 0)

  const totalAll = sectionWords.biblia + sectionWords.livro + sectionWords.contos

  const pills: Array<{ label: string; words: number; color: string }> = [
    { label: "Bíblia", words: sectionWords.biblia, color: "var(--blue-cold)" },
    { label: "Livro", words: sectionWords.livro, color: "var(--accent)" },
    { label: "Contos", words: sectionWords.contos, color: "var(--gold)" },
  ]

  return (
    <section className="glass-card rounded-xl overflow-hidden" aria-labelledby="word-dist-heading">
      <div className="px-5 pt-5 pb-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] shrink-0"
                style={{
                  background: "color-mix(in oklch, var(--foreground) 7%, transparent)",
                  color: "var(--muted-foreground)",
                }}
              >
                Palavras
              </span>
              <h2
                id="word-dist-heading"
                className="font-serif text-xl leading-tight"
                style={{ color: "var(--foreground)" }}
              >
                Distribuição por seção
              </h2>
            </div>
            <p className="font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
              {formatWords(totalAll)} palavras no total do projeto
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {pills.map((p) => (
            <span
              key={p.label}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs"
              style={{
                background: `color-mix(in oklch, ${p.color} 15%, transparent)`,
                border: `1px solid color-mix(in oklch, ${p.color} 30%, transparent)`,
                color: p.color,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: p.color,
                  flexShrink: 0,
                }}
              />
              {p.label}
              <span
                className="font-serif text-sm"
                style={{ color: "var(--foreground)" }}
              >
                {formatWords(p.words)}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x"
        style={{ borderTop: "1px solid var(--border)", borderColor: "var(--border)" }}
      >
        <div className="px-5 py-4 flex flex-col gap-3">
          <h3
            className="font-sans text-[10px] uppercase tracking-widest"
            style={{ color: "var(--muted-foreground)" }}
          >
            Livro
          </h3>
          {activeChapters.length === 0 ? (
            <p className="font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
              Sem capítulos com palavras.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {activeChapters.map((ch) => (
                <BarRow
                  key={ch.slug}
                  label={truncate(ch.title, 20)}
                  words={ch.words}
                  maxWords={maxChapterWords}
                  barColor="color-mix(in oklch, var(--accent) 40%, transparent)"
                  extra={<TensionDot score={ch.tensionScore} />}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          <h3
            className="font-sans text-[10px] uppercase tracking-widest"
            style={{ color: "var(--muted-foreground)" }}
          >
            Contos
          </h3>
          {activeContos.length === 0 ? (
            <p className="font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
              Sem contos com palavras.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {activeContos.map((slug) => (
                <BarRow
                  key={slug}
                  label={slug.charAt(0).toUpperCase() + slug.slice(1)}
                  words={contoWordCounts[slug] ?? 0}
                  maxWords={maxContoWords}
                  barColor="color-mix(in oklch, var(--gold) 40%, transparent)"
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          <h3
            className="font-sans text-[10px] uppercase tracking-widest"
            style={{ color: "var(--muted-foreground)" }}
          >
            Bíblia
          </h3>
          {bibliaEntries.length === 0 ? (
            <p className="font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
              Sem partes com palavras.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {bibliaEntries.map((e) => (
                <BarRow
                  key={e.label}
                  label={e.label}
                  words={e.words}
                  maxWords={maxBibliaWords}
                  barColor="color-mix(in oklch, var(--blue-cold) 40%, transparent)"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
