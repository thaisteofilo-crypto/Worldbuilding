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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>Dashboard</h1>
          <p className="mt-1 font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
            Painel de controle do mundo de Koru
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-sm transition-opacity hover:opacity-80"
          style={{ color: "var(--foreground)", border: "1px solid var(--border)", background: "var(--surface)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Ver site
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Palavras" value={formatNumber(analytics.totalWords)} sub="no universo" icon={<WordsIcon />} color="var(--accent)" />
        <StatCard label="Documentos" value={analytics.totalDocuments.toString()} sub={`${analytics.bibliaComplete} biblia · ${analytics.livroChapters} livro`} icon={<DocsIcon />} color="var(--gold)" />
        <StatCard label="Tarefas" value={`${completionPercent}%`} sub={`${taskStats.done}/${taskStats.total} concluidas`} icon={<TasksIcon />} color="var(--blue-cold)" />
        <StatCard label="Galeria" value={analytics.totalGallery.toString()} sub={`${analytics.totalBanners} banners`} icon={<GalleryIcon />} color="oklch(0.55 0.12 150)" />
      </div>

      {/* Diagnóstico — full width, 2-col grid */}
      <div className="rounded-xl p-6 glass-card mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--muted-foreground) 12%, transparent)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h2 className="font-serif text-xl" style={{ color: "var(--foreground)" }}>Diagnostico</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {insights.map((insight, i) => (
            <div key={i} className="rounded-lg p-4" style={{ background: "var(--surface)" }}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-sans font-bold"
                    style={{ background: insight.color + "22", color: insight.color }}
                  >
                    {insight.type === "fix" ? "!" : insight.type === "gap" ? "?" : insight.type === "rhythm" ? "~" : insight.type === "coverage" ? "○" : "✓"}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-sans text-sm font-medium leading-snug" style={{ color: "var(--foreground)" }}>{insight.title}</p>
                    {insight.category && (
                      <span className="font-sans text-[9px] uppercase tracking-wider shrink-0" style={{ color: insight.color, opacity: 0.8 }}>{insight.category}</span>
                    )}
                  </div>
                  <p className="font-sans text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{insight.body}</p>
                  {insight.action && (
                    <p className="font-sans text-[11px] mt-1.5 font-medium" style={{ color: insight.color }}>→ {insight.action}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Arc — compact strip */}
      <div className="rounded-xl p-5 glass-card mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-serif text-base" style={{ color: "var(--foreground)" }}>Arco da Historia</h2>
              <p className="font-sans text-[11px]" style={{ color: "var(--muted-foreground)" }}>Tensao narrativa por capitulo</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={analyzeEmotions}
                disabled={analyzingEmotions || !analytics || analytics.chapters.length === 0}
                className="rounded-full px-3 py-1.5 font-sans text-[11px] transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                style={{ background: "oklch(0.40 0.12 290)", color: "white" }}
              >
                {analyzingEmotions ? (
                  <>
                    <svg className="animate-spin shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
              {emotionData.length > 0 && !analyzingEmotions && (
                <button
                  onClick={clearEmotionCache}
                  className="rounded-full px-2.5 py-1.5 font-sans text-[10px] transition-opacity hover:opacity-70"
                  style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                  title="Limpar cache"
                >
                  Limpar
                </button>
              )}
              {emotionErrors > 0 && !analyzingEmotions && (
                <span className="font-sans text-[10px]" style={{ color: "oklch(0.55 0.18 27)" }}>
                  {emotionErrors} erro{emotionErrors > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "oklch(0.45 0.12 290)" }} /> Tensao
            </span>
            <span className="flex items-center gap-1.5 font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "oklch(0.48 0.12 65)" }} /> Palavras
            </span>
          </div>
        </div>
        <StoryArcChart chapters={chapters} />
      </div>

      {/* Emotion Analysis */}
      {emotionData.length > 0 && (
        <div className="mb-8">
          <div className="rounded-xl p-6 glass-card mb-4">
            <h2 className="font-serif text-xl mb-1" style={{ color: "var(--foreground)" }}>Mapa Emocional</h2>
            <p className="font-sans text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
              Intensidade emocional por capitulo (analise IA)
            </p>
            <EmotionChart data={emotionData} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {emotionData.map((ch) => {
              const dominant = ch.emotions.reduce((best, e) => e.intensity > best.intensity ? e : best, ch.emotions[0])
              const arcLabels: Record<string, string> = { rising: "Ascensao", falling: "Queda", climax: "Climax", resolution: "Resolucao" }
              return (
                <div key={ch.chapter} className="rounded-xl p-4 glass-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-sm" style={{ color: "var(--foreground)" }}>
                      {ch.chapter === "epilogo" ? "Epilogo" : `Cap. ${ch.chapter}`}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-wide"
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
                  <p className="font-sans text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {ch.summary}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Progress bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ProgressCard
          label="Biblia"
          value={analytics.bibliaComplete}
          max={9}
          color="var(--gold)"
          words={analytics.sectionWords.biblia ?? 0}
        />
        <ProgressCard
          label="Livro"
          value={analytics.livroChapters}
          max={7}
          color="var(--blue-cold)"
          words={analytics.sectionWords.livro ?? 0}
        />
        <ProgressCard
          label="Contos"
          value={analytics.contosWritten}
          max={analytics.totalContos}
          color="var(--accent)"
          words={analytics.sectionWords.contos ?? 0}
        />
      </div>

      {/* Character mentions heatmap */}
      {chapters.length > 0 && Object.keys(analytics.charMentions).length > 0 && (
        <div className="rounded-xl p-6 mb-8 glass-card">
          <h2 className="font-serif text-xl mb-1" style={{ color: "var(--foreground)" }}>Presenca por Capitulo</h2>
          <p className="font-sans text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Mencoes de personagens no livro</p>
          <CharacterHeatmap chapters={chapters} mentions={analytics.charMentions} />
        </div>
      )}

      {/* Quick links grid */}
      <div className="mb-6">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--muted-foreground)" }}>Acesso rapido</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <QuickLink href="/admin/tasks" label="Tarefas" count={taskStats.todo} icon={<TasksIcon />} />
          <QuickLink href="/admin/documents" label="Documentos" count={analytics.totalDocuments} icon={<DocsIcon />} />
          <QuickLink href="/admin/characters" label="Personagens" count={analytics.totalCharacters} icon={<CharsIcon />} />
          <QuickLink href="/admin/banners" label="Banners" count={analytics.totalBanners} icon={<BannersIcon />} />
          <QuickLink href="/admin/gallery" label="Galeria" count={analytics.totalGallery} icon={<GalleryIcon />} />
        </div>
      </div>

      {/* Recent tasks */}
      <div className="rounded-xl p-6 glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl" style={{ color: "var(--foreground)" }}>Tarefas Pendentes</h2>
          <Link href="/admin/tasks" className="font-sans text-xs" style={{ color: "var(--foreground)" }}>Ver tudo →</Link>
        </div>
        <TasksList />
      </div>
    </div>
  )
}

/* ─── Story Arc Chart (SVG) ─── */

function StoryArcChart({ chapters }: { chapters: ChapterData[] }) {
  if (chapters.length === 0) {
    return <p className="font-sans text-sm py-8 text-center" style={{ color: "var(--muted-foreground)" }}>Nenhum capitulo com conteudo.</p>
  }

  const maxTension = Math.max(...chapters.map((c) => c.tensionScore), 1)
  // Use log scale for words to avoid Cap01 crushing everything else
  const wordValues = chapters.map((c) => Math.log(Math.max(c.words, 1)))
  const maxWordLog = Math.max(...wordValues, 1)

  const W = 640
  const H = 120
  const padX = 12
  const padTop = 20
  const padBottom = 20
  const chartW = W - padX * 2
  const chartH = H - padTop - padBottom

  const getX = (i: number) => padX + (i / Math.max(chapters.length - 1, 1)) * chartW

  const tensionPoints = chapters.map((c, i) => {
    const x = getX(i)
    const y = padTop + chartH - (c.tensionScore / maxTension) * chartH
    return { x, y, str: `${x},${y}` }
  })

  const wordPoints = chapters.map((c, i) => {
    const x = getX(i)
    const y = padTop + chartH - (wordValues[i] / maxWordLog) * chartH
    return { x, y, str: `${x},${y}` }
  })

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

  const tensionPath = smoothPath(tensionPoints)
  const wordPath = smoothPath(wordPoints)
  const wordAreaPath = wordPath + ` L ${wordPoints[wordPoints.length - 1].x},${padTop + chartH} L ${wordPoints[0].x},${padTop + chartH} Z`

  const peakIdx = chapters.reduce((best, c, i) => c.tensionScore > chapters[best].tensionScore ? i : best, 0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="wordsFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.48 0.12 65)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="oklch(0.48 0.12 65)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="tensionStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.45 0.12 290)" />
          <stop offset="100%" stopColor="oklch(0.50 0.15 290)" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.5, 1].map((v) => {
        const y = padTop + chartH - v * chartH
        return <line key={v} x1={padX} y1={y} x2={W - padX} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray={v === 0 ? "none" : "3,4"} />
      })}

      {/* Words area (filled + line) */}
      <path d={wordAreaPath} fill="url(#wordsFill)" />
      <path d={wordPath} fill="none" stroke="oklch(0.48 0.12 65 / 0.5)" strokeWidth="1.5" />

      {/* Word dots */}
      {chapters.map((c, i) => (
        <g key={`w-${c.slug}`}>
          <circle cx={wordPoints[i].x} cy={wordPoints[i].y} r="2" fill="oklch(0.48 0.12 65 / 0.6)" />
          <text x={wordPoints[i].x} y={wordPoints[i].y - 6} textAnchor="middle" className="font-sans" fill="oklch(0.48 0.12 65 / 0.7)" fontSize="7">
            {c.words >= 1000 ? (c.words / 1000).toFixed(1) + "k" : c.words}
          </text>
        </g>
      ))}

      {/* Tension line (smooth curve) */}
      <path d={tensionPath} fill="none" stroke="url(#tensionStroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Tension dots + values */}
      {chapters.map((c, i) => {
        const { x, y } = tensionPoints[i]
        const isPeak = i === peakIdx
        return (
          <g key={`t-${c.slug}`}>
            {isPeak && <circle cx={x} cy={y} r="10" fill="oklch(0.55 0.18 27 / 0.1)" />}
            <circle cx={x} cy={y} r={isPeak ? 4.5 : 3} fill={isPeak ? "oklch(0.55 0.18 27)" : "oklch(0.45 0.12 290)"} stroke={isPeak ? "oklch(0.55 0.18 27 / 0.3)" : "none"} strokeWidth="2" />
            {isPeak && (
              <text x={x} y={y - 14} textAnchor="middle" className="font-sans" fill="oklch(0.55 0.18 27)" fontSize="8" fontWeight="700" letterSpacing="0.5">
                PICO
              </text>
            )}
            <text x={x} y={y + (isPeak ? 16 : 13)} textAnchor="middle" className="font-sans" fill="oklch(0.45 0.12 290 / 0.8)" fontSize="7" fontWeight="500">
              {c.tensionScore}
            </text>
          </g>
        )
      })}

      {/* X axis labels */}
      {chapters.map((c, i) => (
        <text key={`lbl-${c.slug}`} x={getX(i)} y={H - 4} textAnchor="middle" className="font-sans" fill="var(--muted-foreground)" fontSize="9" fontWeight={i === peakIdx ? "600" : "400"}>
          {c.slug === "epilogo" ? "Epi" : `Cap ${c.slug}`}
        </text>
      ))}
    </svg>
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
                  title={`${name} em ${ch.title}: ${count} mencoes`}
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
    <div className="rounded-xl p-5 flex items-center gap-4 glass-card">
      <div className="relative">
        <ProgressRing value={value} max={max} color={color} />
        <span className="absolute inset-0 flex items-center justify-center font-sans text-xs font-bold" style={{ color }}>
          {percent}%
        </span>
      </div>
      <div>
        <p className="font-sans text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</p>
        <p className="font-sans text-[11px]" style={{ color: "var(--muted-foreground)" }}>
          {value}/{max} partes · {formatNumber(words)} palavras
        </p>
      </div>
    </div>
  )
}

/* ─── Stat Card ─── */

function StatCard({ label, value, sub, icon, color }: { label: string; value: string; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl p-5 glass-card" style={{ borderTop: `2px solid color-mix(in oklch, ${color} 40%, transparent)` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans text-xs uppercase tracking-[0.12em]" style={{ color: "var(--muted-foreground)" }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in oklch, ${color} 14%, transparent)`, color }}>
          {icon}
        </div>
      </div>
      <p className="font-serif text-3xl leading-none" style={{ color: "var(--foreground)" }}>{value}</p>
      <p className="font-sans text-[11px] mt-1.5" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
    </div>
  )
}

/* ─── Quick Link ─── */

function QuickLink({ href, label, count, icon }: { href: string; label: string; count: number; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group rounded-xl p-4 flex items-center gap-3 transition-all duration-150 hover:scale-[1.02] glass-card"
      style={{ borderLeft: '2px solid transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderLeft = '2px solid var(--accent)'
        e.currentTarget.style.paddingLeft = 'calc(1rem - 2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderLeft = '2px solid transparent'
        e.currentTarget.style.paddingLeft = '1rem'
      }}
    >
      <div style={{ color: "var(--accent)", opacity: 0.7 }}>{icon}</div>
      <div>
        <p className="font-sans text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</p>
        <p className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>{count}</p>
      </div>
    </Link>
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
        <div key={task.id} className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: "var(--surface)" }}>
          <span className="font-sans text-xs" style={{ color: task.priority === "high" ? "oklch(0.55 0.18 27)" : "var(--muted-foreground)" }}>
            {PRIORITY_ICONS[task.priority] ?? "–"}
          </span>
          <p className="font-sans text-sm flex-1 truncate" style={{ color: "var(--foreground)" }}>{task.title}</p>
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
    const names = skeletons.map((c) => c.slug === "epilogo" ? "Epilogo" : `Cap ${c.slug}`).join(", ")
    const pct = Math.round((skeletons.length / chapters.length) * 100)
    insights.push({
      type: "fix",
      category: "estrutura",
      title: `${skeletons.length} capitulo${skeletons.length > 1 ? "s" : ""} ainda ${skeletons.length > 1 ? "sao" : "e"} esqueleto`,
      body: `${names} — ${pct}% do livro tem menos de 500 palavras. Cap 01 tem ${formatNumber(longest.words)} palavras. Os esqueletos precisam de expansao para o arco funcionar.`,
      action: `Usar /expand-chapter para expandir ${skeletons[0].slug === "epilogo" ? "Epilogo" : `capitulo ${skeletons[0].slug}`}`,
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
        title: "Climax acontece cedo demais",
        body: `O pico de tensao esta no Cap ${chapters[peakIdx].slug} (score ${tensionValues[peakIdx]}), mas deveria estar entre Cap ${chapters[expectedClimaxRange[0]].slug} e Cap ${chapters[expectedClimaxRange[1]].slug} para um arco classico. O leitor pode perder interesse na segunda metade.`,
        action: "Aumentar a tensao nos capitulos 04-05 com conflito fisico ou revelacao",
        color: "oklch(0.48 0.12 65)",
      })
    } else if (peakIdx >= expectedClimaxRange[0] && peakIdx <= expectedClimaxRange[1]) {
      insights.push({
        type: "ok",
        category: "ritmo",
        title: "Arco narrativo bem posicionado",
        body: `Climax no Cap ${chapters[peakIdx].slug} (score ${tensionValues[peakIdx]}). Posicao ideal para resolucao no final.`,
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
        title: "Queda abrupta de tensao no final",
        body: `Os ultimos capitulos tem tensao muito baixa (${lastTwo.join(", ")}) comparado ao pico (${peak}). A resolucao pode parecer abrupta.`,
        action: "Adicionar ecos de tensao ou consequencias nos capitulos finais",
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
  const temikuAbsent = chapters.filter((c) => !charMentions[c.slug]?.temiku).map((c) => c.slug === "epilogo" ? "Epilogo" : `Cap ${c.slug}`)
  if (temikuAbsent.length > 0 && temikuAbsent.length < chapters.length) {
    insights.push({
      type: "coverage",
      category: "personagens",
      title: `Temiku ausente em ${temikuAbsent.join(", ")}`,
      body: `Como protagonista, Temiku deveria aparecer ou ser referenciada em todos os capitulos. A ausencia cria descontinuidade no arco central.`,
      action: "Verificar se a presenca de Temiku esta implicita ou se o capitulo precisa de reescrita",
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
      title: `${singleAppear.join(", ")} — aparece${singleAppear.length > 1 ? "m" : ""} em 1 capitulo so`,
      body: `Personagens com aparicao unica podem parecer artificiais. Se sao importantes para o arco, precisam de mais presenca. Se nao sao, avaliar se a mencao unica serve a narrativa.`,
      action: "Considerar adicionar referencias a esses personagens em capitulos adjacentes",
      color: "oklch(0.42 0.10 230)",
    })
  }

  // ─── 4. DIALOGUE DENSITY: chapters with almost no dialogue ───
  const lowDialogue = chapters.filter((c) => c.words > 500 && c.dialogueLines < 3)
  if (lowDialogue.length > 0) {
    const names = lowDialogue.map((c) => c.slug === "epilogo" ? "Epilogo" : `Cap ${c.slug}`).join(", ")
    insights.push({
      type: "gap",
      category: "voz",
      title: `Quase sem dialogo: ${names}`,
      body: `Capitulos longos sem dialogo podem ficar densos demais. Mesmo em narrativas introspectivas, breves trocas iluminam relacoes.`,
      action: "Avaliar se a ausencia e intencional ou se falta interacao entre personagens",
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
      body: `Os contos de origem (Amara, Oruku, Beku) devem vir antes dos contos de contexto (Obaru, Kemdi, Temi). O conto de Orike e o ultimo — perspectiva nao-animal.`,
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
          title: "Ritmo uniforme entre capitulos",
          body: `Media de frase varia apenas ${variation} palavras entre capitulos (${Math.min(...avgSentences)}-${Math.max(...avgSentences)} palavras). Cada capitulo deveria ter um pulso proprio. Cap 01 (descoberta) pode ser mais lento; Cap 04-05 (conflito) mais cortado.`,
          action: "Variar o comprimento medio de frase por capitulo conforme o tom",
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
        title: `Narrativa e ${ratio}% da biblia`,
        body: `${formatNumber(narrativeTotal)} palavras narrativas vs ${formatNumber(bibliaWords)} de referencia. O mundo esta bem documentado, mas a narrativa precisa crescer para dar vida a ele.`,
        action: "Expandir capitulos 02-06 e escrever contos pendentes",
        color: "oklch(0.48 0.12 65)",
      })
    } else {
      insights.push({
        type: "ok",
        category: "balanco",
        title: "Equilibrio biblia/narrativa saudavel",
        body: `Narrativa tem ${ratio}% do volume da biblia (${formatNumber(narrativeTotal)} vs ${formatNumber(bibliaWords)}).`,
        color: "oklch(0.45 0.12 150)",
      })
    }
  }

  return insights.slice(0, 8)
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
