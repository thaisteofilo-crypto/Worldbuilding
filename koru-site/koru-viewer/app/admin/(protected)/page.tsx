"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import type { Task } from "@/lib/database.types"

/* ─── Analytics types ─── */

interface ChapterData {
  slug: string
  title: string
  words: number
  dialogueLines: number
  totalLines: number
  paragraphs: number
  avgSentenceLen: number
  tensionScore: number
}

interface EmotionEntry {
  name: string
  intensity: number
  peak_excerpt: string
}

interface ChapterEmotion {
  chapter: string
  emotions: EmotionEntry[]
  overall_tension: number
  narrative_arc: "rising" | "falling" | "climax" | "resolution"
  summary: string
}

interface Analytics {
  totalWords: number
  sectionWords: Record<string, number>
  wordCounts: Record<string, number>
  chapters: ChapterData[]
  charMentions: Record<string, Record<string, number>>
  taskStats: {
    total: number
    todo: number
    inProgress: number
    done: number
    highPriority: number
    byCategory: Record<string, number>
  }
  contosWritten: number
  totalContos: number
  bibliaComplete: number
  livroChapters: number
  totalDocuments: number
  totalCharacters: number
  totalBanners: number
  totalGallery: number
}

/* ─── Helpers ─── */

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k"
  return n.toString()
}

const CONTO_ORDER = ["amara", "oruku", "beku", "obaru", "kemdi", "temi", "orike"] as const

function ProgressRing({ value, max, size = 48, color }: { value: number; max: number; size?: number; color: string }) {
  const r = (size - 6) / 2
  const circumference = 2 * Math.PI * r
  const progress = max > 0 ? value / max : 0
  const offset = circumference * (1 - progress)
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" className="transition-all duration-700"
      />
    </svg>
  )
}

/* ─── Emotion cache helpers ─── */

const EMOTION_CACHE_KEY = "koru-emotion-cache"
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function loadEmotionCache(): Record<string, { data: ChapterEmotion; ts: number }> {
  try {
    return JSON.parse(localStorage.getItem(EMOTION_CACHE_KEY) ?? "{}")
  } catch {
    return {}
  }
}

function saveEmotionCache(cache: Record<string, { data: ChapterEmotion; ts: number }>) {
  try {
    localStorage.setItem(EMOTION_CACHE_KEY, JSON.stringify(cache))
  } catch {}
}

function cacheToArray(cache: Record<string, ChapterEmotion>): ChapterEmotion[] {
  return Object.values(cache)
}

/* ─── Main Dashboard ─── */

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [emotionData, setEmotionData] = useState<ChapterEmotion[]>([])
  const [analyzingEmotions, setAnalyzingEmotions] = useState(false)
  const [emotionProgress, setEmotionProgress] = useState<{ current: number; total: number } | null>(null)
  const [emotionErrors, setEmotionErrors] = useState(0)

  const [universeAnalysis, setUniverseAnalysis] = useState("")
  const [analyzingUniverse, setAnalyzingUniverse] = useState(false)
  const [analysisType, setAnalysisType] = useState<"all" | "inconsistencies" | "feedback" | "report">("all")
  const [activeTab, setActiveTab] = useState<"diagnostico" | "narrativa" | "analise" | "proximos">("diagnostico")

  const [suggestedTasks, setSuggestedTasks] = useState<Array<{_id: number; title: string; description: string; category: string; priority: string}>>([])
  const [suggestingTasks, setSuggestingTasks] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set()) // keyed by _id
  const [savingTasks, setSavingTasks] = useState(false)
  const [dragSuggestId, setDragSuggestId] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => { setAnalytics(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const clearEmotionCache = useCallback(() => {
    try { localStorage.removeItem(EMOTION_CACHE_KEY) } catch {}
    setEmotionData([])
  }, [])

  const analyzeEmotions = useCallback(async () => {
    if (!analytics || analytics.chapters.length === 0) return
    setAnalyzingEmotions(true)
    setEmotionErrors(0)

    const chapters = analytics.chapters
    const BATCH_SIZE = 3
    const now = Date.now()

    // Load cache and seed already-valid results immediately
    const cache = loadEmotionCache()
    const liveResults: Record<string, ChapterEmotion> = {}

    chapters.forEach((ch) => {
      const cached = cache[ch.slug]
      if (cached && now - cached.ts <= CACHE_TTL_MS) {
        liveResults[ch.slug] = cached.data
      }
    })

    if (Object.keys(liveResults).length > 0) {
      setEmotionData(cacheToArray(liveResults))
    }

    const chaptersToAnalyze = chapters.filter((ch) => {
      const cached = cache[ch.slug]
      return !cached || now - cached.ts > CACHE_TTL_MS
    })

    setEmotionProgress({ current: chapters.length - chaptersToAnalyze.length, total: chapters.length })

    let errorCount = 0

    for (let i = 0; i < chaptersToAnalyze.length; i += BATCH_SIZE) {
      const batch = chaptersToAnalyze.slice(i, i + BATCH_SIZE)

      const batchResults = await Promise.allSettled(
        batch.map((ch) =>
          fetch("/api/analyze-emotion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chapter: ch.slug }),
          })
            .then((r) => r.json())
            .then((data: ChapterEmotion) => ({ slug: ch.slug, data }))
        )
      )

      const updatedCache = loadEmotionCache()

      batchResults.forEach((result) => {
        if (result.status === "fulfilled" && result.value.data?.emotions) {
          const { slug, data } = result.value
          liveResults[slug] = data
          updatedCache[slug] = { data, ts: Date.now() }
        } else {
          errorCount++
        }
      })

      saveEmotionCache(updatedCache)

      const processed = chapters.length - chaptersToAnalyze.length + Math.min(i + BATCH_SIZE, chaptersToAnalyze.length)
      setEmotionProgress({ current: processed, total: chapters.length })
      setEmotionData(cacheToArray(liveResults))
      setEmotionErrors(errorCount)
    }

    setAnalyzingEmotions(false)
    setEmotionProgress(null)
  }, [analytics])

  const analyzeUniverse = useCallback(async () => {
    setAnalyzingUniverse(true)
    setUniverseAnalysis("")
    try {
      const res = await fetch("/api/analyze-universe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: analysisType }),
      })
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }))
        setUniverseAnalysis(`Erro: ${err.error}`)
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6).trim()
          if (data === "[DONE]") break
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) setUniverseAnalysis((prev) => prev + parsed.text)
            if (parsed.error) setUniverseAnalysis((prev) => prev + `\nErro: ${parsed.error}`)
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      setUniverseAnalysis(`Erro: ${err instanceof Error ? err.message : "Falha na analise"}`)
    } finally {
      setAnalyzingUniverse(false)
    }
  }, [analysisType])

  const suggestTasks = useCallback(async () => {
    if (!universeAnalysis) return
    setSuggestingTasks(true)
    setSuggestedTasks([])
    setSelectedTaskIds(new Set())
    try {
      const res = await fetch("/api/suggest-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: universeAnalysis }),
      })
      const data = await res.json()
      if (data.tasks) {
        const stamped = data.tasks.map((t: {title: string; description: string; category: string; priority: string}, i: number) => ({ ...t, _id: i }))
        setSuggestedTasks(stamped)
        setSelectedTaskIds(new Set(stamped.map((t: {_id: number}) => t._id)))
      }
    } catch {
      // ignore
    } finally {
      setSuggestingTasks(false)
    }
  }, [universeAnalysis])

  const addSelectedTasks = useCallback(async () => {
    const toAdd = suggestedTasks.filter((_, i) => selectedTaskIds.has(i))
    if (toAdd.length === 0) return
    setSavingTasks(true)
    try {
      await Promise.all(
        toAdd.map((t) =>
          fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: t.title, description: t.description, category: t.category, priority: t.priority, status: "todo" }),
          })
        )
      )
      setSuggestedTasks([])
      setSelectedTaskIds(new Set())
      window.location.href = "/admin/tasks"
    } finally {
      setSavingTasks(false)
    }
  }, [suggestedTasks, selectedTaskIds])

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-32">
        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--foreground)" }} />
      </div>
    )
  }

  if (!analytics) {
    return <p className="font-sans text-sm py-8" style={{ color: "oklch(0.50 0.01 280)" }}>Erro ao carregar analytics.</p>
  }

  const { taskStats, chapters } = analytics
  const completionPercent = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0

  // Generate AI insights
  const insights = generateInsights(analytics)

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>Dashboard</h1>
          <p className="mt-1 font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
            Painel de controle do mundo de Koru
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-full px-4 py-2 font-sans text-sm transition-opacity hover:opacity-80"
          style={{ color: "var(--foreground)", border: "1px solid var(--border)", background: "var(--surface)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Ver site
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Palavras" value={formatNumber(analytics.totalWords)} sub="no universo" icon={<WordsIcon />} color="var(--accent)" />
        <StatCard label="Documentos" value={analytics.totalDocuments.toString()} sub={`${analytics.bibliaComplete} biblia · ${analytics.livroChapters} livro`} icon={<DocsIcon />} color="var(--gold)" />
        <StatCard label="Tarefas" value={`${completionPercent}%`} sub={`${taskStats.done}/${taskStats.total} concluidas`} icon={<TasksIcon />} color="var(--blue-cold)" />
        <StatCard label="Galeria" value={analytics.totalGallery.toString()} sub={`${analytics.totalBanners} banners`} icon={<GalleryIcon />} color="oklch(0.55 0.12 150)" />
      </div>

      {/* Painel IA integrado */}
      <div className="rounded-xl glass-card overflow-hidden mb-4">
        {/* Abas */}
        <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
          {(["diagnostico", "narrativa", "analise", "proximos"] as const).map((tab) => {
            const labels: Record<string, string> = {
              diagnostico: "Diagnóstico",
              narrativa: "Narrativa",
              analise: "Análise da IA",
              proximos: "Próximos Passos",
            }
            const active = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-3 font-sans text-xs transition-colors"
                style={{
                  color: active ? "var(--foreground)" : "var(--muted-foreground)",
                  borderBottom: active ? "2px solid var(--foreground)" : "2px solid transparent",
                  background: "transparent",
                  marginBottom: "-1px",
                }}
              >
                {labels[tab]}
              </button>
            )
          })}
        </div>

        {/* Aba: Diagnostico */}
        {activeTab === "diagnostico" && (
          <div className="p-4 flex flex-col gap-4">
            {/* Progress rings */}
            <div className="grid grid-cols-3 gap-3">
              <ProgressCard label="Bíblia" value={analytics.bibliaComplete} max={9} color="var(--gold)" words={analytics.sectionWords.biblia ?? 0} />
              <ProgressCard label="Livro" value={analytics.livroChapters} max={7} color="var(--blue-cold)" words={analytics.sectionWords.livro ?? 0} />
              <ProgressCard label="Contos" value={analytics.contosWritten} max={analytics.totalContos || 7} color="var(--accent)" words={analytics.sectionWords.contos ?? 0} />
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {insights.map((insight, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: "var(--surface)" }}>
                    <div className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-sans font-bold"
                        style={{ background: "var(--surface)", color: "var(--muted-foreground)" }}
                      >
                        {insight.type === "fix" ? "!" : insight.type === "gap" ? "?" : insight.type === "rhythm" ? "~" : insight.type === "coverage" ? "○" : "✓"}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <p className="font-sans text-[13px] font-medium leading-snug" style={{ color: "var(--foreground)" }}>{insight.title}</p>
                          {insight.category && (
                            <span className="font-sans text-[9px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)", opacity: 0.8 }}>{insight.category}</span>
                          )}
                        </div>
                        <p className="font-sans text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{insight.body}</p>
                        {insight.action && (
                          <p className="font-sans text-[10px] mt-1 font-medium" style={{ color: "var(--foreground)" }}>→ {insight.action}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Story arc */}
            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.12em] mb-2" style={{ color: "var(--muted-foreground)" }}>Arco da História</p>
              <StoryArcChart chapters={chapters} />
            </div>

            {/* Heatmap */}
            {chapters.length > 0 && Object.keys(analytics.charMentions).length > 0 && (
              <div>
                <p className="font-sans text-[11px] uppercase tracking-[0.12em] mb-2" style={{ color: "var(--muted-foreground)" }}>Presença por Capítulo</p>
                <CharacterHeatmap chapters={chapters} mentions={analytics.charMentions} />
              </div>
            )}
          </div>
        )}

        {/* Aba: Narrativa */}
        {activeTab === "narrativa" && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-sans text-sm font-medium" style={{ color: "var(--foreground)" }}>Mapa Emocional</p>
                <p className="font-sans text-[11px]" style={{ color: "var(--muted-foreground)" }}>Intensidade emocional por capítulo — análise IA</p>
              </div>
              <div className="flex items-center gap-2">
                {emotionData.length > 0 && !analyzingEmotions && (
                  <button
                    onClick={clearEmotionCache}
                    className="rounded-full px-3 py-1.5 font-sans text-[10px] transition-opacity hover:opacity-70"
                    style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                  >
                    Limpar
                  </button>
                )}
                {emotionErrors > 0 && !analyzingEmotions && (
                  <span className="font-sans text-[10px]" style={{ color: "oklch(0.55 0.18 27)" }}>
                    {emotionErrors} erro{emotionErrors > 1 ? "s" : ""}
                  </span>
                )}
                <button
                  onClick={analyzeEmotions}
                  disabled={analyzingEmotions || analytics.chapters.length === 0}
                  className="rounded-full px-4 py-1.5 font-sans text-xs transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                  style={{ background: "var(--foreground)", color: "var(--background)" }}
                >
                  {analyzingEmotions ? (
                    <>
                      <svg className="animate-spin shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      {emotionProgress ? `${emotionProgress.current}/${emotionProgress.total}` : "..."}
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Analisar IA
                    </>
                  )}
                </button>
              </div>
            </div>

            {emotionData.length > 0 ? (
              <>
                <EmotionChart data={emotionData} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {emotionData.map((ch) => {
                    const dominant = ch.emotions.reduce((best, e) => e.intensity > best.intensity ? e : best, ch.emotions[0])
                    const arcLabels: Record<string, string> = { rising: "Ascensão", falling: "Queda", climax: "Clímax", resolution: "Resolução" }
                    return (
                      <div key={ch.chapter} className="rounded-xl p-4 glass-card">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif text-sm" style={{ color: "var(--foreground)" }}>
                            {ch.chapter === "epilogo" ? "Epílogo" : `Cap. ${ch.chapter}`}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 font-sans text-[10px] uppercase tracking-wide"
                            style={{
                              color: EMOTION_COLORS[dominant.name] ?? "var(--muted-foreground)",
                              background: `color-mix(in oklch, ${EMOTION_COLORS[dominant.name] ?? "var(--muted-foreground)"} 12%, transparent)`,
                            }}
                          >
                            {dominant.name} ({Math.round(dominant.intensity * 100)}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-sans text-[10px] uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                            {arcLabels[ch.narrative_arc] ?? ch.narrative_arc}
                          </span>
                          <span className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                            Tensao: {Math.round(ch.overall_tension * 100)}%
                          </span>
                        </div>
                        <p className="font-sans text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{ch.summary}</p>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)", opacity: 0.25 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>Nenhuma análise gerada ainda.</p>
                <p className="font-sans text-[11px] text-center max-w-xs" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>Clique em "Analisar IA" para gerar o mapa emocional capítulo por capítulo.</p>
              </div>
            )}
          </div>
        )}

        {/* Aba: Analise da IA */}
        {activeTab === "analise" && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {(["all", "inconsistencies", "feedback", "report"] as const).map((t) => {
                const labels: Record<string, string> = {
                  all: "Análise completa",
                  inconsistencies: "Inconsistências",
                  feedback: "Feedback narrativo",
                  report: "Relatório",
                }
                return (
                  <button
                    key={t}
                    onClick={() => setAnalysisType(t)}
                    className="rounded-full px-3 py-1.5 font-sans text-xs transition-all"
                    style={{
                      background: analysisType === t ? "var(--foreground)" : "var(--surface)",
                      color: analysisType === t ? "var(--background)" : "var(--muted-foreground)",
                      border: analysisType === t ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {labels[t]}
                  </button>
                )
              })}
              <button
                onClick={analyzeUniverse}
                disabled={analyzingUniverse}
                className="ml-auto flex items-center gap-1.5 rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-opacity disabled:opacity-50"
                style={{ background: "var(--foreground)", color: "var(--background)" }}
              >
                {analyzingUniverse ? (
                  <>
                    <svg className="animate-spin shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Analisando...
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    Gerar análise
                  </>
                )}
              </button>
            </div>

            {universeAnalysis || analyzingUniverse ? (
              <div className="rounded-xl p-4 min-h-[200px] max-h-[600px] overflow-y-auto" style={{ background: "var(--surface)" }}>
                {universeAnalysis ? (
                  <MarkdownView text={universeAnalysis} />
                ) : (
                  <div className="flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                    <svg className="animate-spin shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span className="font-sans text-sm">Lendo documentos e gerando análise...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)", opacity: 0.25 }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>Nenhuma análise gerada ainda.</p>
                <p className="font-sans text-[11px]" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>Selecione um tipo e clique em "Gerar análise".</p>
              </div>
            )}

            {/* Sugerir tarefas — only when analysis is done */}
            {universeAnalysis && !analyzingUniverse && (
              <div className="mt-3">
                {suggestedTasks.length === 0 ? (
                  <button
                    onClick={suggestTasks}
                    disabled={suggestingTasks}
                    className="flex items-center gap-1.5 rounded-full px-4 py-1.5 font-sans text-xs transition-opacity disabled:opacity-50"
                    style={{ background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                  >
                    {suggestingTasks ? (
                      <>
                        <svg className="animate-spin shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                        Extraindo tarefas...
                      </>
                    ) : (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Sugerir tarefas a partir da análise
                      </>
                    )}
                  </button>
                ) : (
                  <div className="rounded-xl p-4" style={{ background: "var(--surface)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-sans text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {suggestedTasks.length} tarefas sugeridas
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTaskIds(selectedTaskIds.size === suggestedTasks.length ? new Set() : new Set(suggestedTasks.map((t) => t._id)))}
                          className="font-sans text-[11px]"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {selectedTaskIds.size === suggestedTasks.length ? "Desmarcar todas" : "Selecionar todas"}
                        </button>
                        <button
                          onClick={addSelectedTasks}
                          disabled={savingTasks || selectedTaskIds.size === 0}
                          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-opacity disabled:opacity-50"
                          style={{ background: "var(--foreground)", color: "var(--background)" }}
                        >
                          {savingTasks ? "Salvando..." : `Adicionar ${selectedTaskIds.size} à lista de tarefas →`}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {suggestedTasks.map((task, i) => {
                        const selected = selectedTaskIds.has(task._id)
                        const isDragging = dragSuggestId === task._id
                        const priorityColors: Record<string, string> = { high: "oklch(0.62 0.16 27)", normal: "var(--muted-foreground)", low: "var(--muted-foreground)" }
                        const priorityLabel: Record<string, string> = { high: "↑ alta", normal: "normal", low: "↓ baixa" }
                        return (
                          <div
                            key={task._id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = "move"
                              setDragSuggestId(task._id)
                            }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                            onDrop={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (dragSuggestId === null || dragSuggestId === task._id) return
                              const fromIdx = suggestedTasks.findIndex((t) => t._id === dragSuggestId)
                              const toIdx = i
                              const next = [...suggestedTasks]
                              const [moved] = next.splice(fromIdx, 1)
                              next.splice(toIdx, 0, moved)
                              setSuggestedTasks(next)
                              setDragSuggestId(null)
                            }}
                            onDragEnd={() => setDragSuggestId(null)}
                            onClick={() => {
                              const next = new Set(selectedTaskIds)
                              if (selected) next.delete(task._id)
                              else next.add(task._id)
                              setSelectedTaskIds(next)
                            }}
                            className="relative flex flex-col gap-2 rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition-all glass-card"
                            style={{
                              outline: selected ? "1.5px solid var(--foreground)" : "1.5px solid transparent",
                              opacity: isDragging ? 0.35 : selected ? 1 : 0.55,
                            }}
                          >
                            {/* Checkbox top-right */}
                            <div
                              className="absolute top-3 right-3 w-4 h-4 rounded flex items-center justify-center shrink-0"
                              style={{ background: selected ? "var(--foreground)" : "transparent", border: selected ? "none" : "1px solid var(--border)" }}
                            >
                              {selected && (
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--background)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-1.5 pr-6">
                              <span className="font-sans text-[10px] uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>{task.category}</span>
                              <span className="font-sans text-[10px]" style={{ color: priorityColors[task.priority] ?? "var(--muted-foreground)" }}>
                                · {priorityLabel[task.priority] ?? task.priority}
                              </span>
                            </div>

                            {/* Title */}
                            <p className="font-sans text-sm font-medium leading-snug" style={{ color: "var(--foreground)" }}>{task.title}</p>

                            {/* Description */}
                            {task.description && (
                              <p className="font-sans text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{task.description}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Aba: Proximos Passos */}
        {activeTab === "proximos" && (
          <div className="p-4 flex flex-col gap-3">
            {/* Personagens */}
            <NextBlock title="Personagens" done={analytics.totalCharacters} total={analytics.totalCharacters} note={`${analytics.totalCharacters} no banco`}>
              <Link
                href="/admin/characters"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-sans text-xs transition-colors"
                style={{ background: "var(--surface)", color: "var(--foreground)" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Adicionar personagem
              </Link>
            </NextBlock>

            {/* Biblia */}
            <NextBlock title="Bíblia" done={analytics.bibliaComplete} total={9} note={`${analytics.bibliaComplete}/9 partes`}>
              <Link
                href="/admin/editor"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-sans text-xs transition-colors"
                style={{ background: "var(--surface)", color: "var(--foreground)" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Abrir editor
              </Link>
            </NextBlock>

            {/* Contos */}
            <NextBlock
              title="Contos"
              done={analytics.contosWritten}
              total={CONTO_ORDER.length}
              note={`${analytics.contosWritten}/${CONTO_ORDER.length} escritos`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 w-full">
                {CONTO_ORDER.map((name) => {
                  const words = analytics.wordCounts[name] ?? 0
                  const done = words > 200
                  return (
                    <div key={name} className="flex items-center gap-2 rounded-lg px-2.5 py-2" style={{ background: "var(--surface)" }}>
                      <span
                        className="shrink-0 w-2.5 h-2.5 rounded-full"
                        style={{ background: done ? "var(--foreground)" : "var(--border)" }}
                      />
                      <span className="font-sans text-xs capitalize flex-1 truncate" style={{ color: "var(--foreground)" }}>{name}</span>
                      {done ? (
                        <span className="font-sans text-[10px] tabular-nums shrink-0" style={{ color: "var(--muted-foreground)" }}>{formatNumber(words)}</span>
                      ) : (
                        <span
                          className="font-mono text-[9px] rounded px-1 shrink-0"
                          style={{ color: "var(--muted-foreground)", background: "var(--surface)" }}
                        >
                          /write
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </NextBlock>

            {/* Livro */}
            <NextBlock
              title="Livro"
              done={chapters.filter((c) => c.words >= 1000).length}
              total={chapters.length}
              note={`${chapters.length} capitulos`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 w-full">
                {chapters.map((ch) => {
                  const done = ch.words >= 1000
                  return (
                    <div key={ch.slug} className="flex items-center gap-2 rounded-lg px-2.5 py-2" style={{ background: "var(--surface)" }}>
                      <span
                        className="shrink-0 w-2.5 h-2.5 rounded-full"
                        style={{ background: done ? "var(--foreground)" : "var(--border)" }}
                      />
                      <span className="font-sans text-xs flex-1" style={{ color: "var(--foreground)" }}>
                        {ch.slug === "epilogo" ? "Epílogo" : `Cap ${ch.slug}`}
                      </span>
                      {done ? (
                        <span className="font-sans text-[10px] tabular-nums shrink-0" style={{ color: "var(--muted-foreground)" }}>{formatNumber(ch.words)}</span>
                      ) : (
                        <span
                          className="font-mono text-[9px] rounded px-1 shrink-0"
                          style={{ color: "var(--muted-foreground)", background: "var(--surface)" }}
                        >
                          /expand
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </NextBlock>
          </div>
        )}
      </div>

      {/* Tarefas */}
      <div className="rounded-xl p-4 glass-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-base" style={{ color: "var(--foreground)" }}>Tarefas Pendentes</h2>
          <Link href="/admin/tasks" className="font-sans text-xs" style={{ color: "var(--foreground)" }}>Ver tudo →</Link>
        </div>
        <TasksList />
      </div>
    </div>
  )
}

/* ─── Story Arc Chart ─── */

function StoryArcChart({ chapters }: { chapters: ChapterData[] }) {
  if (chapters.length === 0) {
    return <p className="font-sans text-sm py-8 text-center" style={{ color: "var(--muted-foreground)" }}>Nenhum capítulo com conteúdo.</p>
  }

  const maxWords = Math.max(...chapters.map((c) => c.words), 1)
  const maxTension = Math.max(...chapters.map((c) => c.tensionScore), 1)
  const peakIdx = chapters.reduce((best, c, i) => c.tensionScore > chapters[best].tensionScore ? i : best, 0)

  return (
    <div className="flex flex-col gap-2.5">
      {chapters.map((ch, i) => {
        const wordPct = (ch.words / maxWords) * 100
        const tensionPct = (ch.tensionScore / maxTension) * 100
        const isPeak = i === peakIdx
        const label = ch.slug === "epilogo" ? "Epílogo" : `Cap. ${ch.slug}`

        return (
          <div key={ch.slug} className="flex items-center gap-3">
            {/* Label */}
            <span
              className="font-sans text-xs shrink-0 w-16 text-right"
              style={{ color: isPeak ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: isPeak ? 600 : 400 }}
            >
              {label}
            </span>

            {/* Bars */}
            <div className="flex-1 flex flex-col gap-1">
              {/* Palavras */}
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(wordPct, 2)}%`, background: "oklch(0.60 0.09 65 / 0.55)" }}
                />
              </div>
              {/* Tensão */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.max(tensionPct, 2)}%`,
                    background: isPeak ? "oklch(0.62 0.16 27 / 0.85)" : "oklch(0.52 0.10 270 / 0.5)",
                  }}
                />
              </div>
            </div>

            {/* Valores */}
            <div className="shrink-0 flex flex-col items-end w-20">
              <span className="font-sans text-[10px] tabular-nums leading-snug" style={{ color: "var(--foreground)" }}>
                {ch.words >= 1000 ? (ch.words / 1000).toFixed(1) + "k" : ch.words} pal.
              </span>
              <span
                className="font-sans text-[10px] leading-snug"
                style={{ color: isPeak ? "oklch(0.62 0.16 27)" : "var(--muted-foreground)" }}
              >
                {tensionPct >= 80 ? "↑ pico" : tensionPct >= 50 ? "alta" : tensionPct >= 25 ? "média" : "baixa"}
              </span>
            </div>
          </div>
        )
      })}

      {/* Legenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 mt-0.5" style={{ borderTop: "1px solid var(--border)" }}>
        <span className="flex items-center gap-1.5 font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          <span className="w-3 h-2 rounded-sm inline-block" style={{ background: "oklch(0.60 0.09 65 / 0.55)" }} />
          Palavras
        </span>
        <span className="flex items-center gap-1.5 font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          <span className="w-3 h-1.5 rounded-sm inline-block" style={{ background: "oklch(0.52 0.10 270 / 0.5)" }} />
          Tensão (relativa entre capítulos)
        </span>
        <span className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
          baixa · média · alta · ↑ pico
        </span>
      </div>
    </div>
  )
}

/* ─── Emotion Colors ─── */

const EMOTION_COLORS: Record<string, string> = {
  melancolia: "oklch(0.45 0.12 290)",
  "esperança": "oklch(0.48 0.12 65)",
  medo: "oklch(0.50 0.15 27)",
  ternura: "oklch(0.45 0.12 150)",
  "tensão": "oklch(0.42 0.10 230)",
}

/* ─── Emotion Chart (SVG) ─── */

function EmotionChart({ data }: { data: ChapterEmotion[] }) {
  if (data.length === 0) return null

  const W = 640
  const H = 180
  const padX = 36
  const padTop = 16
  const padBottom = 22
  const chartW = W - padX * 2
  const chartH = H - padTop - padBottom

  const emotionNames = ["melancolia", "esperança", "medo", "ternura", "tensão"]
  const colors = [
    "oklch(0.45 0.12 290)",
    "oklch(0.48 0.12 65)",
    "oklch(0.50 0.15 27)",
    "oklch(0.45 0.12 150)",
    "oklch(0.42 0.10 230)",
  ]

  const getX = (i: number) => padX + (i / Math.max(data.length - 1, 1)) * chartW

  // Smooth curve helper
  const smoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return ""
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i].x + pts[i + 1].x) / 2
      d += ` C ${cx} ${pts[i].y}, ${cx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`
    }
    return d
  }

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => {
          const y = padTop + chartH - v * chartH
          return (
            <g key={v}>
              <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray={v === 0 ? "none" : "3,4"} />
              <text x={padX - 5} y={y + 3} textAnchor="end" className="font-sans" fill="var(--muted-foreground)" fontSize="7">
                {Math.round(v * 100)}%
              </text>
            </g>
          )
        })}

        {/* Emotion smooth curves */}
        {emotionNames.map((name, ei) => {
          const pts = data.map((ch, i) => {
            const emotion = ch.emotions.find((e) => e.name === name)
            const intensity = emotion?.intensity ?? 0
            return { x: getX(i), y: padTop + chartH - intensity * chartH }
          })
          return (
            <path
              key={name}
              d={smoothPath(pts)}
              fill="none"
              stroke={colors[ei]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )
        })}

        {/* Dots */}
        {emotionNames.map((name, ei) =>
          data.map((ch, i) => {
            const emotion = ch.emotions.find((e) => e.name === name)
            const intensity = emotion?.intensity ?? 0
            const x = getX(i)
            const y = padTop + chartH - intensity * chartH
            return (
              <circle key={`${name}-${ch.chapter}`} cx={x} cy={y} r={2.5} fill={colors[ei]} />
            )
          })
        )}

        {/* X axis labels */}
        {data.map((ch, i) => (
          <text key={ch.chapter} x={getX(i)} y={H - 4} textAnchor="middle" className="font-sans" fill="var(--muted-foreground)" fontSize="9">
            {ch.chapter === "epilogo" ? "Epi" : `Cap ${ch.chapter}`}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-1 justify-center">
        {emotionNames.map((name, i) => (
          <span key={name} className="flex items-center gap-1.5 font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: colors[i] }} />
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Character Heatmap ─── */

function CharacterHeatmap({ chapters, mentions }: { chapters: ChapterData[]; mentions: Record<string, Record<string, number>> }) {
  // Collect all character names
  const allNames = new Set<string>()
  for (const m of Object.values(mentions)) {
    for (const name of Object.keys(m)) allNames.add(name)
  }
  const names = Array.from(allNames).sort()
  if (names.length === 0) return null

  const maxMention = Math.max(
    ...Object.values(mentions).flatMap((m) => Object.values(m)),
    1
  )

  return (
    <div className="overflow-x-auto">
      <div className="grid" style={{ gridTemplateColumns: `100px repeat(${chapters.length}, 1fr)`, gap: "2px" }}>
        {/* Header row */}
        <div />
        {chapters.map((ch) => (
          <div key={ch.slug} className="font-sans text-[10px] text-center py-1 truncate" style={{ color: "var(--muted-foreground)" }}>
            {ch.slug === "epilogo" ? "Epi" : `C${ch.slug}`}
          </div>
        ))}

        {/* Data rows */}
        {names.map((name) => (
          <>
            <div key={`label-${name}`} className="font-sans text-xs capitalize truncate py-1.5 pr-2" style={{ color: "var(--foreground)" }}>
              {name}
            </div>
            {chapters.map((ch) => {
              const count = mentions[ch.slug]?.[name] ?? 0
              const intensity = count / maxMention
              return (
                <div
                  key={`${name}-${ch.slug}`}
                  className="rounded flex items-center justify-center min-h-[28px]"
                  style={{
                    background: count > 0 ? `oklch(0.45 0.12 290 / ${0.08 + intensity * 0.5})` : "var(--surface)",
                  }}
                  title={`${name} em ${ch.title}: ${count} menções`}
                >
                  {count > 0 && (
                    <span className="font-sans text-[10px] font-medium" style={{ color: intensity > 0.5 ? "white" : "oklch(0.45 0.12 290)" }}>
                      {count}
                    </span>
                  )}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}

/* ─── Progress Card ─── */

function ProgressCard({ label, value, max, color, words }: { label: string; value: number; max: number; color: string; words: number }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="rounded-xl p-4 flex items-center gap-3 glass-card">
      <div className="relative shrink-0">
        <ProgressRing value={value} max={max} size={40} color={color} />
        <span className="absolute inset-0 flex items-center justify-center font-sans text-[10px] font-bold" style={{ color }}>{percent}%</span>
      </div>
      <div>
        <p className="font-sans text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</p>
        <p className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>{value}/{max} · {formatNumber(words)} palavras</p>
      </div>
    </div>
  )
}

/* ─── Stat Card ─── */

function StatCard({ label, value, sub, icon, color }: { label: string; value: string; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl p-4 glass-card flex items-center gap-3">
      <div className="shrink-0" style={{ color: "var(--muted-foreground)" }}>{icon}</div>
      <div className="min-w-0">
        <p className="font-sans text-[10px] uppercase tracking-[0.15em] mb-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</p>
        <p className="font-serif text-2xl leading-none" style={{ color: "var(--foreground)" }}>{value}</p>
        <p className="font-sans text-[10px] mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
      </div>
    </div>
  )
}

/* ─── Tasks List (compact) ─── */

const CATEGORY_COLORS: Record<string, string> = {
  conto: "oklch(0.45 0.12 290)",
  capitulo: "oklch(0.48 0.12 65)",
  biblia: "oklch(0.42 0.10 230)",
  site: "oklch(0.45 0.12 150)",
  outro: "oklch(0.50 0.01 280)",
}

const PRIORITY_ICONS: Record<string, string> = {
  high: "↑",
  normal: "–",
  low: "↓",
}

function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks")
    const data = await res.json()
    setTasks((data.tasks ?? []).filter((t: Task) => t.status !== "done").slice(0, 8))
    setLoading(false)
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  if (loading) return <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>Carregando...</p>

  if (tasks.length === 0) return <p className="font-sans text-sm py-4 text-center" style={{ color: "var(--muted-foreground)" }}>Nenhuma tarefa pendente.</p>

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: "var(--surface)" }}>
          <span className="font-sans text-xs" style={{ color: task.priority === "high" ? "oklch(0.55 0.18 27)" : "var(--muted-foreground)" }}>
            {PRIORITY_ICONS[task.priority] ?? "–"}
          </span>
          <p className="font-sans text-[13px] flex-1 truncate" style={{ color: "var(--foreground)" }}>{task.title}</p>
          <span
            className="rounded px-2 py-0.5 font-sans text-[10px] uppercase tracking-wide shrink-0"
            style={{
              color: CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.outro,
              background: `color-mix(in oklch, ${CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.outro} 10%, transparent)`,
            }}
          >
            {task.category}
          </span>
          <span
            className="rounded px-2 py-0.5 font-sans text-[10px] shrink-0"
            style={{
              color: task.status === "in_progress" ? "oklch(0.45 0.12 150)" : "var(--muted-foreground)",
              background: task.status === "in_progress" ? "oklch(0.45 0.12 150 / 0.1)" : "transparent",
            }}
          >
            {task.status === "in_progress" ? "Em andamento" : "A fazer"}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── AI Insights Generator ─── */

interface Insight {
  type: "fix" | "gap" | "rhythm" | "coverage" | "ok"
  category?: string
  title: string
  body: string
  action?: string
  color: string
}

function generateInsights(analytics: Analytics): Insight[] {
  const insights: Insight[] = []
  const { chapters, charMentions, contosWritten, totalContos, sectionWords } = analytics

  if (chapters.length === 0) return insights

  const longest = chapters.reduce((best, c) => c.words > best.words ? c : best, chapters[0])

  // ─── 1. STRUCTURAL BALANCE: chapters that are skeletons vs full ───
  const skeletons = chapters.filter((c) => c.words < 500 && c.slug !== "epilogo")
  if (skeletons.length > 0) {
    const names = skeletons.map((c) => c.slug === "epilogo" ? "Epílogo" : `Cap ${c.slug}`).join(", ")
    const pct = Math.round((skeletons.length / chapters.length) * 100)
    insights.push({
      type: "fix",
      category: "estrutura",
      title: `${skeletons.length} capítulo${skeletons.length > 1 ? "s" : ""} ainda ${skeletons.length > 1 ? "são" : "é"} esqueleto`,
      body: `${names}: ${pct}% do livro tem menos de 500 palavras. Cap 01 tem ${formatNumber(longest.words)} palavras. Os esqueletos precisam de expansão para o arco funcionar.`,
      action: `Usar /expand-chapter para expandir ${skeletons[0].slug === "epilogo" ? "Epílogo" : `capítulo ${skeletons[0].slug}`}`,
      color: "oklch(0.55 0.18 27)",
    })
  }

  // ─── 2. TENSION ARC: is there a proper narrative arc? ───
  if (chapters.length >= 4) {
    const tensionValues = chapters.map((c) => c.tensionScore)
    const peakIdx = tensionValues.indexOf(Math.max(...tensionValues))
    const expectedClimaxRange = [Math.floor(chapters.length * 0.5), Math.floor(chapters.length * 0.8)]

    if (peakIdx < expectedClimaxRange[0]) {
      insights.push({
        type: "rhythm",
        category: "ritmo",
        title: "Clímax acontece cedo demais",
        body: `O pico de tensão está no Cap ${chapters[peakIdx].slug} (score ${tensionValues[peakIdx]}), mas deveria estar entre Cap ${chapters[expectedClimaxRange[0]].slug} e Cap ${chapters[expectedClimaxRange[1]].slug} para um arco clássico. O leitor pode perder interesse na segunda metade.`,
        action: "Aumentar a tensão nos capítulos 04-05 com conflito físico ou revelação",
        color: "oklch(0.48 0.12 65)",
      })
    } else if (peakIdx >= expectedClimaxRange[0] && peakIdx <= expectedClimaxRange[1]) {
      insights.push({
        type: "ok",
        category: "ritmo",
        title: "Arco narrativo bem posicionado",
        body: `Clímax no Cap ${chapters[peakIdx].slug} (score ${tensionValues[peakIdx]}). Posição ideal para resolução no final.`,
        color: "oklch(0.45 0.12 150)",
      })
    }

    // Check if tension drops too sharply
    const lastTwo = tensionValues.slice(-2)
    const peak = Math.max(...tensionValues)
    if (peak > 0 && lastTwo.every((v) => v < peak * 0.3)) {
      insights.push({
        type: "rhythm",
        category: "ritmo",
        title: "Queda abrupta de tensão no final",
        body: `Os últimos capítulos têm tensão muito baixa (${lastTwo.join(", ")}) comparado ao pico (${peak}). A resolução pode parecer abrupta.`,
        action: "Adicionar ecos de tensão ou consequências nos capítulos finais",
        color: "oklch(0.42 0.10 230)",
      })
    }
  }

  // ─── 3. CHARACTER COVERAGE: who is absent where they should be? ───
  const allChars = new Set<string>()
  for (const m of Object.values(charMentions)) {
    for (const name of Object.keys(m)) allChars.add(name)
  }

  // Temiku should appear in every chapter
  const temikuAbsent = chapters.filter((c) => !charMentions[c.slug]?.temiku).map((c) => c.slug === "epilogo" ? "Epílogo" : `Cap ${c.slug}`)
  if (temikuAbsent.length > 0 && temikuAbsent.length < chapters.length) {
    insights.push({
      type: "coverage",
      category: "personagens",
      title: `Temiku ausente em ${temikuAbsent.join(", ")}`,
      body: `Como protagonista, Temiku deveria aparecer ou ser referenciada em todos os capítulos. A ausência cria descontinuidade no arco central.`,
      action: "Verificar se a presença de Temiku está implícita ou se o capítulo precisa de reescrita",
      color: "oklch(0.45 0.12 290)",
    })
  }

  // Characters that appear only once
  const charAppearances: Record<string, number> = {}
  for (const m of Object.values(charMentions)) {
    for (const [name, count] of Object.entries(m)) {
      if (count > 0) charAppearances[name] = (charAppearances[name] ?? 0) + 1
    }
  }
  const singleAppear = Object.entries(charAppearances).filter(([, count]) => count === 1).map(([name]) => name)
  if (singleAppear.length > 0) {
    insights.push({
      type: "coverage",
      category: "personagens",
      title: `${singleAppear.join(", ")}, aparece${singleAppear.length > 1 ? "m" : ""} em 1 capítulo só`,
      body: `Personagens com aparição única podem parecer artificiais. Se são importantes para o arco, precisam de mais presença. Se não são, avaliar se a menção única serve a narrativa.`,
      action: "Considerar adicionar referências a esses personagens em capítulos adjacentes",
      color: "oklch(0.42 0.10 230)",
    })
  }

  // ─── 4. DIALOGUE DENSITY: chapters with almost no dialogue ───
  const lowDialogue = chapters.filter((c) => c.words > 500 && c.dialogueLines < 3)
  if (lowDialogue.length > 0) {
    const names = lowDialogue.map((c) => c.slug === "epilogo" ? "Epílogo" : `Cap ${c.slug}`).join(", ")
    insights.push({
      type: "gap",
      category: "voz",
      title: `Quase sem diálogo: ${names}`,
      body: `Capítulos longos sem diálogo podem ficar densos demais. Mesmo em narrativas introspectivas, breves trocas iluminam relações.`,
      action: "Avaliar se a ausência é intencional ou se falta interação entre personagens",
      color: "oklch(0.48 0.12 65)",
    })
  }

  // ─── 5. CONTOS STATUS: specific next steps ───
  if (contosWritten < totalContos) {
    const contoOrder = ["amara", "oruku", "beku", "obaru", "kemdi", "temi", "orike"]
    const contoWordCounts = analytics.wordCounts
    const nextConto = contoOrder.find((name) => (contoWordCounts[name] ?? 0) < 200)
    insights.push({
      type: "gap",
      category: "contos",
      title: `${contosWritten}/${totalContos} contos escritos`,
      body: `Os contos de origem (Amara, Oruku, Beku) devem vir antes dos contos de contexto (Obaru, Kemdi, Temi). O conto de Orike é o último, perspectiva não-animal.`,
      action: nextConto ? `Proximo: /write-conto ${nextConto}` : undefined,
      color: "oklch(0.45 0.12 290)",
    })
  }

  // ─── 6. SENTENCE RHYTHM: variation analysis ───
  if (chapters.length > 0) {
    const avgSentences = chapters.filter((c) => c.words > 300).map((c) => c.avgSentenceLen)
    if (avgSentences.length > 1) {
      const variation = Math.max(...avgSentences) - Math.min(...avgSentences)
      if (variation < 3) {
        insights.push({
          type: "rhythm",
          category: "ritmo",
          title: "Ritmo uniforme entre capítulos",
          body: `Média de frase varia apenas ${variation} palavras entre capítulos (${Math.min(...avgSentences)}-${Math.max(...avgSentences)} palavras). Cada capítulo deveria ter um pulso próprio. Cap 01 (descoberta) pode ser mais lento; Cap 04-05 (conflito) mais cortado.`,
          action: "Variar o comprimento médio de frase por capítulo conforme o tom",
          color: "oklch(0.42 0.10 230)",
        })
      }
    }
  }

  // ─── 7. CONTENT WEIGHT: bible vs narrative ratio ───
  const bibliaWords = sectionWords.biblia ?? 0
  const livroWords = sectionWords.livro ?? 0
  const contosWords = sectionWords.contos ?? 0
  const narrativeTotal = livroWords + contosWords
  if (bibliaWords > 0 && narrativeTotal > 0) {
    const ratio = Math.round((narrativeTotal / bibliaWords) * 100)
    if (ratio < 60) {
      insights.push({
        type: "gap",
        category: "balanco",
        title: `Narrativa é ${ratio}% da bíblia`,
        body: `${formatNumber(narrativeTotal)} palavras narrativas vs ${formatNumber(bibliaWords)} de referência. O mundo está bem documentado, mas a narrativa precisa crescer para dar vida a ele.`,
        action: "Expandir capítulos 02-06 e escrever contos pendentes",
        color: "oklch(0.48 0.12 65)",
      })
    } else {
      insights.push({
        type: "ok",
        category: "balanco",
        title: "Equilíbrio bíblia/narrativa saudável",
        body: `Narrativa tem ${ratio}% do volume da bíblia (${formatNumber(narrativeTotal)} vs ${formatNumber(bibliaWords)}).`,
        color: "oklch(0.45 0.12 150)",
      })
    }
  }

  return insights.slice(0, 8)
}

/* ─── Markdown Renderer ─── */

function MarkdownView({ text }: { text: string }) {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []

  function parseBold(str: string): React.ReactNode {
    const parts = str.split(/\*\*(.+?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} style={{ color: "var(--foreground)", fontWeight: 600 }}>{part}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="font-serif text-xl mt-6 mb-2 first:mt-0" style={{ color: "var(--foreground)" }}>
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="font-sans font-semibold text-base mt-4 mb-1.5" style={{ color: "var(--foreground)" }}>
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={i} className="font-sans font-medium text-sm mt-3 mb-1" style={{ color: "var(--muted-foreground)" }}>
          {line.slice(5)}
        </h4>
      )
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex gap-2 mb-1">
          <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: "var(--muted-foreground)", opacity: 0.5 }} />
          <p className="font-sans text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
            {parseBold(line.slice(2))}
          </p>
        </div>
      )
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} className="my-4" style={{ borderColor: "var(--border)" }} />)
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />)
    } else {
      elements.push(
        <p key={i} className="font-sans text-sm leading-relaxed mb-1" style={{ color: "var(--foreground)" }}>
          {parseBold(line)}
        </p>
      )
    }
    i++
  }

  return <div>{elements}</div>
}

/* ─── Next Block ─── */

function NextBlock({
  title,
  done,
  total,
  note,
  children,
}: {
  title: string
  done: number
  total: number
  note: string
  children: React.ReactNode
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="rounded-xl p-4 glass-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <p className="font-sans text-sm font-medium" style={{ color: "var(--foreground)" }}>{title}</p>
          <span className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>{note}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-20 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: "var(--foreground)" }}
            />
          </div>
          <span className="font-sans text-[10px] tabular-nums w-7 text-right" style={{ color: "var(--muted-foreground)" }}>{pct}%</span>
        </div>
      </div>
      {children}
    </div>
  )
}

/* ─── Icons ─── */

function WordsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
    </svg>
  )
}

function DocsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function TasksIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function GalleryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

function CharsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function BannersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}
