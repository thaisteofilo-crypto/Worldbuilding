"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AIAnalysisPanel } from "@/components/admin/ai-analysis-panel"
import { StatusProgressCard } from "@/components/admin/status-progress-card"
import { DocumentStatus } from "@/lib/document-status"

/* ─── Analytics types ─── */

interface Analytics {
  totalWords: number
  sectionWords: Record<string, number>
  wordCounts: Record<string, number>
  chapters: { slug: string; title: string; words: number }[]
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

/* ─── Helpers ─── */

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k"
  return n.toString()
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

  const { taskStats } = analytics
  const completionPercent = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0

  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl" style={{ color: "var(--foreground)" }}>{greeting}</h1>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Palavras" value={formatNumber(analytics.totalWords)} sub="no universo" icon={<WordsIcon />} color="var(--accent)" href="/admin/editor" />
        <StatCard label="Documentos" value={analytics.totalDocuments.toString()} sub={`${analytics.totalBibliaItems ?? analytics.bibliaComplete} bíblia · ${analytics.livroChapters} livro · ${analytics.totalPersonagens ?? analytics.totalCharacters} person. · ${analytics.totalContos} contos`} icon={<DocsIcon />} color="var(--gold)" href="/admin/editor" />
        <StatCard label="Tarefas" value={`${completionPercent}%`} sub={`${taskStats.done}/${taskStats.total} concluidas`} icon={<TasksIcon />} color="var(--blue-cold)" href="/admin/tasks" />
        <StatCard label="Galeria" value={analytics.totalGallery.toString()} sub={`${analytics.totalBanners} banners`} icon={<GalleryIcon />} color="oklch(0.55 0.12 150)" href="/admin/gallery" />
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

      {/* AI Analysis Panel */}
      <div className="mt-8">
        <AIAnalysisPanel />
      </div>
    </div>
  )
}

/* ─── Stat Card ─── */

function StatCard({ label, value, sub, icon, color, href }: { label: string; value: string; sub: string; icon: React.ReactNode; color: string; href?: string }) {
  const content = (
    <>
      <div className="shrink-0" style={{ color: "var(--muted-foreground)" }}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-[10px] uppercase tracking-[0.15em] mb-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</p>
        <p className="font-serif text-2xl leading-none" style={{ color: "var(--foreground)" }}>{value}</p>
        <p className="font-sans text-[10px] mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
      </div>
      {href && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: "var(--muted-foreground)" }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-xl p-4 glass-card flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="rounded-xl p-4 glass-card flex items-center gap-3">
      {content}
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
