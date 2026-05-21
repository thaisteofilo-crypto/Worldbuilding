"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Type, FileText, CheckSquare, Images, ExternalLink, ChevronRight, FileEdit, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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

/* ─── Section Header ─── */

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <h2 className="font-serif text-lg text-foreground">{title}</h2>
      {subtitle && (
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {subtitle}
        </span>
      )}
    </div>
  )
}

/* ─── Loading skeleton ─── */

function DashboardSkeleton() {
  return (
    <div className="w-full" aria-busy="true" aria-label="Carregando dashboard...">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-40 rounded" />
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      {/* Quick access skeleton */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-24 rounded-full" />
        ))}
      </div>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden">
            <div className="p-5 flex items-start gap-4">
              <Skeleton className="size-5 rounded shrink-0 mt-0.5" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-2 w-16" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
          </div>
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

  const accentColors = ['#0B6377', '#9B6C22', '#707C36', '#BF505C']

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="font-serif text-3xl text-foreground">{greeting}, Thais.</h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Painel de controle · Korú
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-2 border-primary text-primary hover:bg-[#DEF7F9] hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary"
        >
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} aria-hidden="true" />
            Ver site
          </Link>
        </Button>
      </div>

      {/* Quick access */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {[
          { href: '/admin/editor', label: 'Editor', icon: <FileEdit size={13} aria-hidden="true" /> },
          { href: '/admin/tasks', label: 'Tarefas', icon: <CheckSquare size={13} aria-hidden="true" /> },
          { href: '/admin/gallery', label: 'Galeria', icon: <Images size={13} aria-hidden="true" /> },
          { href: '/admin/characters', label: 'Personagens', icon: <Users size={13} aria-hidden="true" /> },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs font-medium bg-primary/8 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-150"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Estatísticas do projeto">
        <StatCard
          label="Palavras"
          value={formatNumber(analytics.totalWords)}
          sub="no universo"
          icon={<Type size={16} aria-hidden="true" />}
          href="/admin/editor"
          accentColor={accentColors[0]}
        />
        <StatCard
          label="Documentos"
          value={analytics.totalDocuments.toString()}
          sub={`${analytics.totalBibliaItems ?? analytics.bibliaComplete} bíblia · ${analytics.livroChapters} livro · ${analytics.totalPersonagens ?? analytics.totalCharacters} person. · ${analytics.totalContos} contos`}
          icon={<FileText size={16} aria-hidden="true" />}
          href="/admin/editor"
          badge={`${completionPercent}%`}
          accentColor={accentColors[1]}
        />
        <StatCard
          label="Tarefas"
          value={`${completionPercent}%`}
          sub={`${taskStats.done}/${taskStats.total} concluídas`}
          icon={<CheckSquare size={16} aria-hidden="true" />}
          href="/admin/tasks"
          accentColor={accentColors[2]}
        />
        <StatCard
          label="Galeria"
          value={analytics.totalGallery.toString()}
          sub="cenas cadastradas"
          icon={<Images size={16} aria-hidden="true" />}
          href="/admin/gallery"
          accentColor={accentColors[3]}
        />
      </div>

      {/* Status Progress */}
      {analytics.statusCounts && analytics.statusTotalTracked !== undefined && (
        <div className="mt-10">
          <SectionHeader title="Status do projeto" subtitle="visão geral" />
          <StatusProgressCard
            counts={analytics.statusCounts}
            totalTracked={analytics.statusTotalTracked}
            withoutStatus={analytics.statusWithoutStatus ?? 0}
          />
        </div>
      )}

      {/* Word Distribution */}
      {analytics.contoWordCounts && analytics.bibliaWordCounts && analytics.mainBibleWords !== undefined && (
        <div className="mt-10">
          <SectionHeader title="Distribuição" subtitle="palavras por seção" />
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
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader title="Tarefas" subtitle={`${taskStats.total} no total`} />
          <TasksBreakdown taskStats={analytics.taskStats} />
        </div>
        {analytics.statusByDoc && analytics.statusCounts && (
          <div>
            <SectionHeader title="Documentos" subtitle="por status" />
            <StatusList
              statusByDoc={analytics.statusByDoc}
              counts={analytics.statusCounts as Record<string, number>}
            />
          </div>
        )}
      </div>

      {/* AI Analysis Panel */}
      <div className="mt-10">
        <SectionHeader title="Análise IA" subtitle="gerado por claude" />
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
  accentColor,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  href?: string
  badge?: string
  accentColor?: string
}) {
  const content = (
    <div className="flex items-start gap-4 p-5">
      <div className="mt-0.5 shrink-0 text-primary">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-2">
          {label}
        </p>
        <div className="flex items-baseline gap-2 mb-1.5">
          <p className="font-serif text-3xl leading-none text-foreground">{value}</p>
          {badge && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {badge}
            </span>
          )}
        </div>
        <p className="font-sans text-xs text-muted-foreground truncate">{sub}</p>
      </div>
      {href && (
        <ChevronRight
          size={14}
          aria-hidden="true"
          className="shrink-0 mt-1 opacity-0 group-hover:opacity-50 transition-opacity text-primary"
        />
      )}
    </div>
  )

  const cls = "group bg-card rounded-xl ring-1 ring-foreground/10 overflow-hidden hover:ring-primary/30 hover:shadow-md transition-all duration-200"
  const style = accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}

  if (href) {
    return (
      <Link
        href={href}
        role="listitem"
        aria-label={`${label}: ${value}`}
        className={cls}
        style={style}
      >
        {content}
      </Link>
    )
  }

  return (
    <div
      role="listitem"
      aria-label={`${label}: ${value}`}
      className={cls}
      style={style}
    >
      {content}
    </div>
  )
}
