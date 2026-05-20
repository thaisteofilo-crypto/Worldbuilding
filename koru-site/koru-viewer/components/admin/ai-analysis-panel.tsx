"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Globe,
  AlertTriangle,
  BookOpen,
  BarChart2,
  ArrowLeftRight,
  Activity,
  Star,
  RefreshCw,
  StopCircle,
  Copy,
  Check,
  Play,
  Send,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

/* ─── Tipos ─── */

type AnalysisType = "all" | "inconsistencies" | "feedback" | "report" | "arc" | "rhythm"

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
    description: "Leitura atenta do mundo inteiro: o que está respirando, o que ainda procura forma, a voz da autora e por onde começar agora.",
    accentVar: "var(--accent)",
    icon: <Globe size={14} />,
  },
  {
    id: "inconsistencies",
    label: "Atritos",
    description: "Onde os textos não estão fechando entre si — morfologia, luz, Bomi Veh, Oruku — com o trecho, o porquê e uma sugestão de reescrita.",
    accentVar: "var(--destructive)",
    icon: <AlertTriangle size={14} />,
  },
  {
    id: "feedback",
    label: "Voz narrativa",
    description: "Leitura literária do livro e dos contos. Temperatura, ritmo, onde a voz vacila, trechos que ilustram.",
    accentVar: "var(--gold)",
    icon: <BookOpen size={14} />,
  },
  {
    id: "report",
    label: "Estado do projeto",
    description: "Onde o projeto está hoje, o que tem densidade, o que ainda é esqueleto, por onde começar agora.",
    accentVar: "var(--blue-cold)",
    icon: <BarChart2 size={14} />,
  },
  {
    id: "arc",
    label: "Arco de Temiku",
    description: "Como Temiku evolui capítulo a capítulo e conto a conto — estado físico, emocional, descontinuidades, o que o arco ainda pede.",
    accentVar: "var(--accent)",
    icon: <ArrowLeftRight size={14} />,
  },
  {
    id: "rhythm",
    label: "Ritmo",
    description: "Análise de abertura, alternância longa/curta, frases nominais, parênteses e fechamento em contenção — ouvindo os textos em voz alta.",
    accentVar: "var(--gold)",
    icon: <Activity size={14} />,
  },
]

const STORAGE_KEY = "koru-admin-ai-analysis-v2"

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
  return { all: null, inconsistencies: null, feedback: null, report: null, arc: null, rhythm: null }
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

  const [followUpInput, setFollowUpInput] = useState("")
  const [followUpThread, setFollowUpThread] = useState<Array<{ question: string; answer: string }>>([])
  const [followUpStreaming, setFollowUpStreaming] = useState(false)
  const [followUpLive, setFollowUpLive] = useState("")

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

  const sendFollowUp = useCallback(async () => {
    if (!followUpInput.trim() || followUpStreaming) return
    const question = followUpInput.trim()
    setFollowUpInput("")
    setFollowUpLive("")
    setFollowUpStreaming(true)

    const conversationHistory = followUpThread.flatMap(item => [
      { role: "user" as const, content: item.question },
      { role: "assistant" as const, content: item.answer },
    ])

    try {
      const res = await fetch("/api/analyze-universe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeType,
          conversationHistory: [
            ...conversationHistory,
            { role: "assistant", content: current?.text ?? "" },
          ],
          followUpQuestion: question,
        }),
      })
      if (!res.ok || !res.body) throw new Error("Falha no follow-up")
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
            if (obj.text) { accumulated += obj.text; setFollowUpLive(accumulated) }
          } catch { /* ignore */ }
        }
      }
      setFollowUpThread(prev => [...prev, { question, answer: accumulated }])
    } catch { /* ignore */ } finally {
      setFollowUpStreaming(false)
      setFollowUpLive("")
    }
  }, [followUpInput, followUpStreaming, followUpThread, activeType, current])

  const hasContent = Boolean(displayText)

  return (
    <GlassCard variant="frosted" className="overflow-hidden" role="region">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div className="min-w-0 md:flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full font-sans text-[10px] uppercase tracking-[0.15em] shrink-0"
                style={{
                  background: "color-mix(in oklch, var(--accent) 14%, transparent)",
                  borderColor: "color-mix(in oklch, var(--accent) 30%, transparent)",
                  color: "var(--accent)",
                }}
              >
                <Star size={10} aria-hidden="true" />
                IA
              </Badge>
              <h2 className="font-serif text-xl leading-tight" style={{ color: "var(--foreground)" }}>
                Análise do universo
              </h2>
            </div>
            <p className="font-sans text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {activeTab.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {current && !streaming && (
              <span className="font-sans text-[10px] whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                Última: {timeAgo(current.generatedAt)}
              </span>
            )}
            {streaming ? (
              <Button
                variant="outline"
                size="sm"
                onClick={stop}
                className="rounded-full gap-1.5"
              >
                <StopCircle size={11} aria-hidden="true" />
                Parar
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={run}
                className="rounded-full gap-1.5"
              >
                <RefreshCw size={11} aria-hidden="true" />
                {current ? "Regenerar" : "Gerar análise"}
              </Button>
            )}
          </div>
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
                setFollowUpThread([])
                setFollowUpInput("")
                setFollowUpLive("")
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copy}
                  className="rounded-full gap-1.5 font-sans text-[11px]"
                >
                  {copied ? (
                    <>
                      <Check size={10} aria-hidden="true" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy size={10} aria-hidden="true" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            )}

            {!streaming && (
              <>
                {/* Follow-up thread */}
                {followUpThread.length > 0 && (
                  <div className="mt-6 flex flex-col gap-4">
                    {followUpThread.map((item, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <span className="font-sans text-[10px] uppercase tracking-[0.12em] shrink-0 mt-0.5" style={{ color: "var(--accent)" }}>Pergunta</span>
                          <p className="font-sans text-sm" style={{ color: "var(--foreground)" }}>{item.question}</p>
                        </div>
                        <div className="pl-4 border-l-2" style={{ borderColor: "color-mix(in oklch, var(--accent) 30%, transparent)" }}>
                          <MarkdownView source={item.answer} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Live follow-up streaming */}
                {followUpStreaming && followUpLive && (
                  <div className="mt-4 pl-4 border-l-2" style={{ borderColor: "color-mix(in oklch, var(--accent) 30%, transparent)" }}>
                    <MarkdownView source={followUpLive} />
                    <span className="inline-block w-2 h-4 ml-0.5 align-middle animate-pulse" style={{ background: "var(--foreground)" }} />
                  </div>
                )}

                {/* Follow-up input */}
                <div className="mt-6 flex gap-2">
                  <input
                    type="text"
                    value={followUpInput}
                    onChange={e => setFollowUpInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFollowUp() } }}
                    placeholder="Perguntar sobre esta análise..."
                    disabled={followUpStreaming}
                    className="flex-1 rounded-full px-4 py-2 font-sans text-sm outline-none disabled:opacity-50"
                    style={{
                      background: "color-mix(in oklch, var(--foreground) 5%, transparent)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <Button
                    onClick={sendFollowUp}
                    disabled={!followUpInput.trim() || followUpStreaming}
                    size="sm"
                    className="rounded-full gap-1.5"
                  >
                    <Send size={11} aria-hidden="true" />
                    {followUpStreaming ? "..." : "Enviar"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </GlassCard>
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
        <Star size={18} aria-hidden="true" />
      </div>
      <div>
        <p className="font-serif text-base" style={{ color: "var(--foreground)" }}>
          A IA lê bíblia, livro e contos e devolve um relatório estruturado.
        </p>
        <p className="font-sans text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
          Leva de 20 a 60 segundos. A resposta é salva localmente — você pode voltar depois sem regenerar.
        </p>
      </div>
      <Button
        size="sm"
        onClick={onRun}
        className="rounded-full gap-1.5"
      >
        <Play size={11} aria-hidden="true" />
        Gerar análise
      </Button>
    </div>
  )
}
