"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

/* ─── Tipos ─── */

type AnalysisType = "all" | "inconsistencies" | "feedback" | "report"

interface SavedAnalysis {
  type: AnalysisType
  text: string
  generatedAt: number
}

interface TabDef {
  id: AnalysisType
  label: string
  description: string
  accentVar: string
  icon: React.ReactNode
}

/* ─── Tabs ─── */

const TABS: TabDef[] = [
  {
    id: "all",
    label: "Visão geral",
    description: "Coerência do mundo, pontos fortes, lacunas, feedback narrativo e próximos passos.",
    accentVar: "var(--accent)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" />
      </svg>
    ),
  },
  {
    id: "inconsistencies",
    label: "Inconsistências",
    description: "Contradições entre bíblia, livro e contos. Morfologia, luz, Bomi Veh, Oruku.",
    accentVar: "var(--destructive)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: "feedback",
    label: "Voz narrativa",
    description: "Análise de voz e estilo nos textos narrativos. Abertura, ritmo, emoções.",
    accentVar: "var(--gold)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: "report",
    label: "Relatório",
    description: "Métricas, estado por seção, dependências e próximos passos priorizados.",
    accentVar: "var(--blue-cold)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14l3-3 4 4 5-6" />
      </svg>
    ),
  },
]

const STORAGE_KEY = "koru-admin-ai-analysis"

/* ─── Persistência ─── */

function loadSaved(): Record<AnalysisType, SavedAnalysis | null> {
  if (typeof window === "undefined") return emptyCache()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyCache()
    const parsed = JSON.parse(raw) as Record<AnalysisType, SavedAnalysis | null>
    return { ...emptyCache(), ...parsed }
  } catch {
    return emptyCache()
  }
}

function emptyCache(): Record<AnalysisType, SavedAnalysis | null> {
  return { all: null, inconsistencies: null, feedback: null, report: null }
}

function saveToCache(cache: Record<AnalysisType, SavedAnalysis | null>) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    /* quota/privacy errors ignored */
  }
}

/* ─── Formatação de tempo ─── */

function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts)
  const m = Math.floor(diff / 60000)
  if (m < 1) return "agora mesmo"
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return `há ${d}d`
}

/* ─── Markdown renderer minimal ─── */

function renderInline(text: string, key: string | number): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let i = 0
  const pattern = /\*\*(.+?)\*\*|`([^`]+)`|\*(.+?)\*/g
  let m: RegExpExecArray | null
  let lastIdx = 0
  while ((m = pattern.exec(text))) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index))
    if (m[1]) parts.push(<strong key={`${key}-b${i++}`} style={{ color: "var(--foreground)" }}>{m[1]}</strong>)
    else if (m[2]) parts.push(<code key={`${key}-c${i++}`} className="rounded px-1 py-0.5 text-[0.85em]" style={{ background: "var(--surface)", color: "var(--accent)" }}>{m[2]}</code>)
    else if (m[3]) parts.push(<em key={`${key}-i${i++}`}>{m[3]}</em>)
    lastIdx = m.index + m[0].length
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx))
  return parts.length ? parts : text
  void remaining
}

function MarkdownView({ source }: { source: string }) {
  const blocks: React.ReactNode[] = []
  const lines = source.split("\n")
  let i = 0
  let blockKey = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) { i++; continue }

    // Headings
    const h3 = trimmed.match(/^###\s+(.*)$/)
    const h2 = trimmed.match(/^##\s+(.*)$/)
    const h1 = trimmed.match(/^#\s+(.*)$/)
    if (h2) {
      blocks.push(
        <h2 key={blockKey++} className="font-serif text-xl mt-6 mb-2 first:mt-0" style={{ color: "var(--foreground)" }}>
          {renderInline(h2[1], blockKey)}
        </h2>
      )
      i++; continue
    }
    if (h3) {
      blocks.push(
        <h3 key={blockKey++} className="font-sans text-sm uppercase tracking-[0.15em] mt-5 mb-2" style={{ color: "var(--muted-foreground)" }}>
          {renderInline(h3[1], blockKey)}
        </h3>
      )
      i++; continue
    }
    if (h1) {
      blocks.push(
        <h1 key={blockKey++} className="font-serif text-2xl mt-6 mb-3 first:mt-0" style={{ color: "var(--foreground)" }}>
          {renderInline(h1[1], blockKey)}
        </h1>
      )
      i++; continue
    }

    // Bullet list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""))
        i++
      }
      blocks.push(
        <ul key={blockKey++} className="font-sans text-sm space-y-1.5 my-3 list-disc pl-5" style={{ color: "var(--foreground)" }}>
          {items.map((it, idx) => <li key={idx}>{renderInline(it, `${blockKey}-${idx}`)}</li>)}
        </ul>
      )
      continue
    }

    // Paragraph
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s+|[-*]\s+)/.test(lines[i].trim())) {
      para.push(lines[i])
      i++
    }
    blocks.push(
      <p key={blockKey++} className="font-sans text-sm leading-relaxed my-2" style={{ color: "var(--foreground)" }}>
        {renderInline(para.join(" "), blockKey)}
      </p>
    )
  }

  return <div>{blocks}</div>
}

/* ─── Componente principal ─── */

export function AIAnalysisPanel() {
  const [activeType, setActiveType] = useState<AnalysisType>("all")
  const [cache, setCache] = useState<Record<AnalysisType, SavedAnalysis | null>>(emptyCache())
  const [streaming, setStreaming] = useState(false)
  const [liveText, setLiveText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setCache(loadSaved())
  }, [])

  const current = cache[activeType]
  const displayText = streaming ? liveText : (current?.text ?? "")
  const activeTab = useMemo(() => TABS.find((t) => t.id === activeType)!, [activeType])

  const run = useCallback(async () => {
    setError(null)
    setLiveText("")
    setStreaming(true)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const res = await fetch("/api/analyze-universe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeType }),
        signal: ctrl.signal,
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Falha ao iniciar análise." }))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() ?? ""
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith("data:")) continue
          const payload = line.slice(5).trim()
          if (payload === "[DONE]") continue
          try {
            const obj = JSON.parse(payload)
            if (obj.error) throw new Error(obj.error)
            if (obj.text) {
              accumulated += obj.text
              setLiveText(accumulated)
            }
          } catch {
            /* ignore malformed chunk */
          }
        }
      }

      const saved: SavedAnalysis = { type: activeType, text: accumulated, generatedAt: Date.now() }
      setCache((prev) => {
        const next = { ...prev, [activeType]: saved }
        saveToCache(next)
        return next
      })
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : "Falha na análise.")
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [activeType])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const copy = useCallback(async () => {
    if (!displayText) return
    try {
      await navigator.clipboard.writeText(displayText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked */
    }
  }, [displayText])

  const hasContent = Boolean(displayText)

  return (
    <section className="rounded-xl glass-card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em]"
              style={{
                background: "color-mix(in oklch, var(--accent) 14%, transparent)",
                color: "var(--accent)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.39 7.36H22l-6.2 4.5 2.39 7.36L12 16.72l-6.19 4.5 2.39-7.36L2 9.36h7.61z" />
              </svg>
              IA
            </span>
            <h2 className="font-serif text-xl" style={{ color: "var(--foreground)" }}>
              Análise do universo
            </h2>
          </div>
          <p className="font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
            {activeTab.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {current && !streaming && (
            <span className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              Última: {timeAgo(current.generatedAt)}
            </span>
          )}
          {streaming ? (
            <button
              onClick={stop}
              className="rounded-full px-3 py-1.5 font-sans text-xs transition-opacity hover:opacity-80"
              style={{ border: "1px solid var(--border)", color: "var(--foreground)" }}
            >
              Parar
            </button>
          ) : (
            <button
              onClick={run}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs transition-opacity hover:opacity-85"
              style={{ background: "var(--foreground)", color: "var(--background)" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              {current ? "Regenerar" : "Gerar análise"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pb-3 flex flex-wrap gap-1.5" role="tablist">
        {TABS.map((tab) => {
          const active = tab.id === activeType
          const tabCache = cache[tab.id]
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (streaming) return
                setActiveType(tab.id)
                setError(null)
              }}
              disabled={streaming && !active}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-xs transition-all disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: active ? "color-mix(in oklch, var(--foreground) 8%, transparent)" : "transparent",
                color: active ? "var(--foreground)" : "var(--muted-foreground)",
                border: `1px solid ${active ? "var(--border)" : "transparent"}`,
              }}
            >
              <span style={{ color: tab.accentVar }}>{tab.icon}</span>
              {tab.label}
              {tabCache && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: tab.accentVar }}
                  aria-label="análise disponível"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Body */}
      <div
        className="px-5 py-5 border-t"
        style={{ borderColor: "color-mix(in oklch, var(--foreground) 10%, transparent)" }}
      >
        {error && (
          <div
            className="mb-3 rounded-lg px-3 py-2 font-sans text-xs"
            style={{
              background: "color-mix(in oklch, var(--destructive) 10%, transparent)",
              color: "var(--destructive)",
              border: "1px solid color-mix(in oklch, var(--destructive) 30%, transparent)",
            }}
          >
            {error}
          </div>
        )}

        {!hasContent && !streaming && !error && (
          <EmptyState onRun={run} />
        )}

        {streaming && !hasContent && (
          <div className="flex items-center gap-2 py-6 font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "300ms" }} />
            </span>
            Lendo bíblia, livro e contos…
          </div>
        )}

        {hasContent && (
          <div className="relative">
            <div className="max-h-[520px] overflow-y-auto pr-1">
              <MarkdownView source={displayText} />
              {streaming && (
                <span
                  className="inline-block w-2 h-4 ml-0.5 align-middle animate-pulse"
                  style={{ background: "var(--foreground)" }}
                />
              )}
            </div>

            {!streaming && (
              <div className="mt-4 pt-3 flex items-center justify-between gap-2 border-t" style={{ borderColor: "var(--border)" }}>
                <span className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                  {current ? `Gerado ${timeAgo(current.generatedAt)}` : "Rascunho"} · modelo Claude Sonnet
                </span>
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[11px] transition-opacity hover:opacity-80"
                  style={{ border: "1px solid var(--border)", color: "var(--foreground)" }}
                >
                  {copied ? (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copiado
                    </>
                  ) : (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copiar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── Empty state ─── */

function EmptyState({ onRun }: { onRun: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 py-4">
      <div
        className="rounded-lg p-3"
        style={{
          background: "color-mix(in oklch, var(--accent) 10%, transparent)",
          color: "var(--accent)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.39 7.36H22l-6.2 4.5 2.39 7.36L12 16.72l-6.19 4.5 2.39-7.36L2 9.36h7.61z" />
        </svg>
      </div>
      <div>
        <p className="font-serif text-base" style={{ color: "var(--foreground)" }}>
          A IA lê bíblia, livro e contos e devolve um relatório estruturado.
        </p>
        <p className="font-sans text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
          Leva de 20 a 60 segundos. A resposta é salva localmente — você pode voltar depois sem regenerar.
        </p>
      </div>
      <button
        onClick={onRun}
        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs transition-opacity hover:opacity-85"
        style={{ background: "var(--foreground)", color: "var(--background)" }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Gerar análise
      </button>
    </div>
  )
}
