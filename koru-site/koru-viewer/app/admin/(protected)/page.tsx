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

/* ─── Main Dashboard ─── */

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => { setAnalytics(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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
        <StatCard label="Palavras" value={formatNumber(analytics.totalWords)} sub="no universo" icon={<WordsIcon />} color="oklch(0.45 0.12 290)" />
        <StatCard label="Documentos" value={analytics.totalDocuments.toString()} sub={`${analytics.bibliaComplete} biblia · ${analytics.livroChapters} livro`} icon={<DocsIcon />} color="oklch(0.48 0.12 65)" />
        <StatCard label="Tarefas" value={`${completionPercent}%`} sub={`${taskStats.done}/${taskStats.total} concluidas`} icon={<TasksIcon />} color="oklch(0.42 0.10 230)" />
        <StatCard label="Galeria" value={analytics.totalGallery.toString()} sub={`${analytics.totalBanners} banners`} icon={<GalleryIcon />} color="oklch(0.45 0.12 150)" />
      </div>

      {/* Two columns: Story Arc + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Story Arc */}
        <div className="lg:col-span-2 rounded-xl p-6 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-xl" style={{ color: "var(--foreground)" }}>Arco da Historia</h2>
              <p className="font-sans text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Tensao narrativa por capitulo</p>
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

        {/* AI Insights */}
        <div className="rounded-xl p-6 glass-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--muted-foreground) 12%, transparent)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h2 className="font-serif text-xl" style={{ color: "var(--foreground)" }}>Analise IA</h2>
          </div>
          <div className="flex flex-col gap-3">
            {insights.map((insight, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: "var(--surface)" }}>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-sans font-bold" style={{ background: insight.color + "22", color: insight.color }}>
                    {insight.type === "peak" ? "P" : insight.type === "warn" ? "!" : insight.type === "tip" ? "i" : "✓"}
                  </span>
                  <div>
                    <p className="font-sans text-xs font-medium leading-snug" style={{ color: "var(--foreground)" }}>{insight.title}</p>
                    <p className="font-sans text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{insight.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <ProgressCard
          label="Biblia"
          value={analytics.bibliaComplete}
          max={9}
          color="oklch(0.48 0.12 65)"
          words={analytics.sectionWords.biblia ?? 0}
        />
        <ProgressCard
          label="Livro"
          value={analytics.livroChapters}
          max={7}
          color="oklch(0.42 0.10 230)"
          words={analytics.sectionWords.livro ?? 0}
        />
        <ProgressCard
          label="Contos"
          value={analytics.contosWritten}
          max={analytics.totalContos}
          color="oklch(0.45 0.12 290)"
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <QuickLink href="/admin/tasks" label="Tarefas" count={taskStats.todo} icon={<TasksIcon />} />
        <QuickLink href="/admin/documents" label="Documentos" count={analytics.totalDocuments} icon={<DocsIcon />} />
        <QuickLink href="/admin/characters" label="Personagens" count={analytics.totalCharacters} icon={<CharsIcon />} />
        <QuickLink href="/admin/banners" label="Banners" count={analytics.totalBanners} icon={<BannersIcon />} />
        <QuickLink href="/admin/gallery" label="Galeria" count={analytics.totalGallery} icon={<GalleryIcon />} />
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
  const maxWords = Math.max(...chapters.map((c) => c.words), 1)
  const W = 600
  const H = 200
  const padX = 40
  const padY = 20
  const chartW = W - padX * 2
  const chartH = H - padY * 2

  const tensionPoints = chapters.map((c, i) => {
    const x = padX + (i / Math.max(chapters.length - 1, 1)) * chartW
    const y = padY + chartH - (c.tensionScore / maxTension) * chartH
    return `${x},${y}`
  })

  const wordPoints = chapters.map((c, i) => {
    const x = padX + (i / Math.max(chapters.length - 1, 1)) * chartW
    const y = padY + chartH - (c.words / maxWords) * chartH
    return `${x},${y}`
  })

  // Find peak tension chapter
  const peakIdx = chapters.reduce((best, c, i) => c.tensionScore > chapters[best].tensionScore ? i : best, 0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: "220px" }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((v) => {
        const y = padY + chartH - v * chartH
        return <line key={v} x1={padX} y1={y} x2={W - padX} y2={y} stroke="var(--border)" strokeWidth="0.5" />
      })}

      {/* Words area (filled) */}
      <polygon
        points={`${padX},${padY + chartH} ${wordPoints.join(" ")} ${padX + chartW},${padY + chartH}`}
        fill="oklch(0.48 0.12 65 / 0.08)"
      />
      <polyline points={wordPoints.join(" ")} fill="none" stroke="oklch(0.48 0.12 65 / 0.4)" strokeWidth="1.5" />

      {/* Tension line */}
      <polyline points={tensionPoints.join(" ")} fill="none" stroke="oklch(0.45 0.12 290)" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Tension dots */}
      {chapters.map((c, i) => {
        const x = padX + (i / Math.max(chapters.length - 1, 1)) * chartW
        const y = padY + chartH - (c.tensionScore / maxTension) * chartH
        const isPeak = i === peakIdx
        return (
          <g key={c.slug}>
            <circle cx={x} cy={y} r={isPeak ? 5 : 3} fill={isPeak ? "oklch(0.55 0.18 27)" : "oklch(0.45 0.12 290)"} />
            {isPeak && (
              <text x={x} y={y - 10} textAnchor="middle" className="font-sans" fill="oklch(0.55 0.18 27)" fontSize="9" fontWeight="600">
                PICO
              </text>
            )}
          </g>
        )
      })}

      {/* X axis labels */}
      {chapters.map((c, i) => {
        const x = padX + (i / Math.max(chapters.length - 1, 1)) * chartW
        return (
          <text key={c.slug} x={x} y={H - 2} textAnchor="middle" className="font-sans" fill="var(--muted-foreground)" fontSize="9">
            {c.slug === "epilogo" ? "Epi" : `Cap ${c.slug}`}
          </text>
        )
      })}
    </svg>
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
    <div className="rounded-xl p-5 glass-card">
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans text-xs uppercase tracking-[0.1em]" style={{ color: "var(--muted-foreground)" }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--muted-foreground) 12%, transparent)", color: "var(--muted-foreground)" }}>
          {icon}
        </div>
      </div>
      <p className="font-serif text-3xl leading-none" style={{ color: "var(--foreground)" }}>{value}</p>
      <p className="font-sans text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
    </div>
  )
}

/* ─── Quick Link ─── */

function QuickLink({ href, label, count, icon }: { href: string; label: string; count: number; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-xl p-4 flex items-center gap-3 transition-all duration-150 hover:scale-[1.02] glass-card"
    >
      <div className="text-[var(--muted-foreground)]">{icon}</div>
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

function generateInsights(analytics: Analytics): { type: "peak" | "warn" | "tip" | "ok"; title: string; body: string; color: string }[] {
  const insights: { type: "peak" | "warn" | "tip" | "ok"; title: string; body: string; color: string }[] = []

  const { chapters, taskStats, contosWritten, totalContos, sectionWords } = analytics

  // Peak tension chapter
  if (chapters.length > 0) {
    const peak = chapters.reduce((best, c) => c.tensionScore > best.tensionScore ? c : best, chapters[0])
    if (peak.tensionScore > 0) {
      insights.push({
        type: "peak",
        title: `Pico de tensao: ${peak.title}`,
        body: `Score ${peak.tensionScore} — ${peak.words} palavras, ${peak.dialogueLines} linhas de dialogo. Este e o capitulo mais intenso.`,
        color: "oklch(0.55 0.18 27)",
      })
    }

    // Shortest chapter warning
    const shortest = chapters.reduce((best, c) => c.words < best.words ? c : best, chapters[0])
    const longest = chapters.reduce((best, c) => c.words > best.words ? c : best, chapters[0])
    if (longest.words > 0 && shortest.words < longest.words * 0.3) {
      insights.push({
        type: "warn",
        title: `${shortest.title} precisa expandir`,
        body: `Apenas ${shortest.words} palavras — ${Math.round((shortest.words / longest.words) * 100)}% do capitulo mais longo (${longest.title}: ${longest.words}).`,
        color: "oklch(0.55 0.15 65)",
      })
    }

    // Average sentence length analysis
    const avgSentence = Math.round(chapters.reduce((s, c) => s + c.avgSentenceLen, 0) / chapters.length)
    if (avgSentence > 25) {
      insights.push({
        type: "tip",
        title: "Frases longas predominam",
        body: `Media de ${avgSentence} palavras por frase. Considere variar com cortes mais curtos para ritmo.`,
        color: "oklch(0.42 0.10 230)",
      })
    }
  }

  // Contos progress
  if (contosWritten < totalContos) {
    insights.push({
      type: "tip",
      title: `${totalContos - contosWritten} contos pendentes`,
      body: `${contosWritten}/${totalContos} contos escritos. Proximo na fila: seguir ordem do workflow.`,
      color: "oklch(0.45 0.12 290)",
    })
  }

  // High priority tasks
  if (taskStats.highPriority > 0) {
    insights.push({
      type: "warn",
      title: `${taskStats.highPriority} tarefa${taskStats.highPriority > 1 ? "s" : ""} de alta prioridade`,
      body: `Existem tarefas urgentes pendentes que podem bloquear progresso.`,
      color: "oklch(0.55 0.18 27)",
    })
  }

  // Content balance
  const bibliaWords = sectionWords.biblia ?? 0
  const livroWords = sectionWords.livro ?? 0
  if (bibliaWords > 0 && livroWords > 0) {
    const ratio = (livroWords / bibliaWords * 100).toFixed(0)
    insights.push({
      type: "ok",
      title: "Balanco biblia/livro",
      body: `Livro tem ${ratio}% do volume da biblia (${formatNumber(livroWords)} vs ${formatNumber(bibliaWords)} palavras).`,
      color: "oklch(0.45 0.12 150)",
    })
  }

  // Task completion rate
  if (taskStats.total > 5) {
    insights.push({
      type: taskStats.done > taskStats.total * 0.5 ? "ok" : "tip",
      title: `Progresso: ${Math.round((taskStats.done / taskStats.total) * 100)}%`,
      body: `${taskStats.done} concluidas, ${taskStats.inProgress} em andamento, ${taskStats.todo} a fazer.`,
      color: taskStats.done > taskStats.total * 0.5 ? "oklch(0.45 0.12 150)" : "oklch(0.48 0.12 65)",
    })
  }

  return insights.slice(0, 6)
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
