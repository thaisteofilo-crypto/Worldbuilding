"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Type, FileText, CheckSquare, Images, ExternalLink, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import { AIAnalysisPanel } from "@/components/admin/ai-analysis-panel"
import { StatusProgressCard } from "@/components/admin/status-progress-card"
import { WordDistribution } from "@/components/admin/word-distribution"
import { TasksBreakdown } from "@/components/admin/tasks-breakdown"
import { StatusList } from "@/components/admin/status-list"
import { DocumentStatus } from "@/lib/document-status"

/* ─── Types ─── */

interface Analytics {
  totalWords: number
  sectionWords: Record<string, number>
  wordCounts: Record<string, number>
  chapters: { slug: string; title: string; words: number; tensionScore: number }[]
  contoWordCounts?: Record<string, number>
  bibliaWordCounts?: Record<string, number>
  mainBibleWords?: number
  statusByDoc?: Record<string, string>
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
  totalBibliaItems: number
  livroChapters: number
  totalDocuments: number
  totalCharacters: number
  totalPersonagens: number
  totalBanners: number
  totalGallery: number
  statusCounts?: Record<DocumentStatus, number>
  statusTotalTracked?: number
  statusWithoutStatus?: number
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k"
  return n.toString()
}

/* ─── Loading skeleton ─── */

function DashboardSkeleton() {
  return (
    <div className="w-full" aria-busy="true" aria-label="Carregando dashboard...">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} variant="frosted" className="p-4 flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </GlassCard>
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  )
}

/* ─── Dashboard ─── */

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => { setAnalytics(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  if (!analytics) {
    return (
      <p className="font-sans text-sm py-8 text-muted-foreground">
        Erro ao carregar analytics.
      </p>
    )
  }

  const { taskStats } = analytics
  const completionPercent = taskStats.total > 0
    ? Math.round((taskStats.done / taskStats.total) * 100)
    : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground">{greeting}</h1>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            Painel de controle do mundo de Korú
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="rounded-full gap-2">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} aria-hidden="true" />
            Ver site
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Estatísticas do projeto">
        <StatCard
          label="Palavras"
          value={formatNumber(analytics.totalWords)}
          sub="no universo"
          icon={<Type size={16} aria-hidden="true" />}
          href="/admin/editor"
        />
        <StatCard
          label="Documentos"
          value={analytics.totalDocuments.toString()}
          sub={`${analytics.totalBibliaItems ?? analytics.bibliaComplete} bíblia · ${analytics.livroChapters} livro · ${analytics.totalPersonagens ?? analytics.totalCharacters} person. · ${analytics.totalContos} contos`}
          icon={<FileText size={16} aria-hidden="true" />}
          href="/admin/editor"
          badge={`${completionPercent}%`}
        />
        <StatCard
          label="Tarefas"
          value={`${completionPercent}%`}
          sub={`${taskStats.done}/${taskStats.total} concluídas`}
          icon={<CheckSquare size={16} aria-hidden="true" />}
          href="/admin/tasks"
        />
        <StatCard
          label="Galeria"
          value={analytics.totalGallery.toString()}
          sub="cenas cadastradas"
          icon={<Images size={16} aria-hidden="true" />}
          href="/admin/gallery"
        />
      </div>

      {/* Status Progress */}
      {analytics.statusCounts && analytics.statusTotalTracked !== undefined && (
        <div className="mt-8">
          <StatusProgressCard
            counts={analytics.statusCounts}
            totalTracked={analytics.statusTotalTracked}
            withoutStatus={analytics.statusWithoutStatus ?? 0}
          />
        </div>
      )}

      {/* Word Distribution */}
      {analytics.contoWordCounts && analytics.bibliaWordCounts && analytics.mainBibleWords !== undefined && (
        <div className="mt-8">
          <WordDistribution
            chapters={analytics.chapters as Array<{ slug: string; title: string; words: number; tensionScore: number }>}
            contoWordCounts={analytics.contoWordCounts}
            bibliaWordCounts={analytics.bibliaWordCounts}
            mainBibleWords={analytics.mainBibleWords}
            sectionWords={analytics.sectionWords as { biblia: number; livro: number; contos: number }}
          />
        </div>
      )}

      {/* Tasks + Status List */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksBreakdown taskStats={analytics.taskStats} />
        {analytics.statusByDoc && analytics.statusCounts && (
          <StatusList
            statusByDoc={analytics.statusByDoc}
            counts={analytics.statusCounts as Record<string, number>}
          />
        )}
      </div>

      {/* AI Analysis Panel */}
      <div className="mt-8">
        <AIAnalysisPanel />
      </div>
    </div>
  )
}

/* ─── Stat Card ─── */

function StatCard({
  label,
  value,
  sub,
  icon,
  href,
  badge,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  href?: string
  badge?: string
}) {
  const inner = (
    <>
      <div className="shrink-0 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-[10px] uppercase tracking-[0.15em] mb-0.5 text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="font-serif text-2xl leading-none text-foreground">{value}</p>
          {badge && <Badge variant="secondary" className="text-[9px]">{badge}</Badge>}
        </div>
        <p className="font-sans text-[10px] mt-0.5 truncate text-muted-foreground">{sub}</p>
      </div>
      {href && (
        <ChevronRight
          size={12}
          aria-hidden="true"
          className="shrink-0 opacity-0 group-hover:opacity-50 transition-opacity text-muted-foreground"
        />
      )}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        role="listitem"
        aria-label={`${label}: ${value}`}
        className="group rounded-2xl border backdrop-blur-md bg-white/10 border-white/25 shadow-[0_4px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.3)] text-foreground p-4 flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {inner}
      </Link>
    )
  }

  return (
    <GlassCard variant="frosted" role="listitem" aria-label={`${label}: ${value}`} className="p-4 flex items-center gap-3">
      {inner}
    </GlassCard>
  )
}
