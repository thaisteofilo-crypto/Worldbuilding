"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, RefreshCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/* ─── Types ─── */

interface Lead {
  id: string
  email: string
  name: string | null
  created_at: string
  last_sign_in_at: string | null
}

/* ─── Helpers ─── */

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function exportCSV(leads: Lead[]) {
  const header = ["Nome", "Email", "Cadastro", "Último acesso"]
  const rows = leads.map((l) => [
    l.name ?? "",
    l.email,
    formatDateTime(l.created_at),
    formatDateTime(l.last_sign_in_at),
  ])
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `koru-leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* ─── Loading skeleton ─── */

function LeadsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Carregando leads...">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3 border-b border-border">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  )
}

/* ─── Main page ─── */

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeads = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/leads")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Erro ao buscar leads")
      }
      const data = await res.json()
      setLeads(data.users ?? [])
      setTotal(data.total ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Audiência
          </p>
          <h1 className="font-serif text-3xl text-foreground">Leads / Usuários</h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Pessoas que se cadastraram para acompanhar o projeto
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLeads(true)}
            disabled={refreshing || loading}
            className="gap-2"
            aria-label="Recarregar lista"
          >
            <RefreshCw
              size={13}
              aria-hidden="true"
              className={refreshing ? "animate-spin" : ""}
            />
            Atualizar
          </Button>

          {leads.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV(leads)}
              className="gap-2 border-primary text-primary hover:bg-[#DEF7F9] hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary"
            >
              <Download size={13} aria-hidden="true" />
              Exportar CSV
            </Button>
          )}
        </div>
      </div>

      {/* Stat */}
      {!loading && !error && (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary rounded-full px-4 py-1.5">
            <Users size={14} aria-hidden="true" />
            <span className="font-mono text-xs font-medium">
              {total === 0
                ? "Nenhuma pessoa cadastrada"
                : total === 1
                ? "1 pessoa cadastrada"
                : `${total} pessoas cadastradas`}
            </span>
          </div>
        </div>
      )}

      {/* States */}
      {loading && <LeadsSkeleton />}

      {!loading && error && (
        <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-5 py-4">
          <p className="font-sans text-sm text-destructive">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchLeads()}
            className="mt-2 text-destructive hover:text-destructive"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {!loading && !error && leads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users size={20} className="text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="font-serif text-xl text-foreground mb-1">
            Nenhum usuário cadastrado ainda
          </p>
          <p className="font-sans text-sm text-muted-foreground">
            Os cadastros vão aparecer aqui quando alguém se registrar no site.
          </p>
        </div>
      )}

      {!loading && !error && leads.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground w-[200px]">
                  Nome
                </TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground w-[130px]">
                  Cadastro
                </TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground w-[160px]">
                  Último acesso
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="border-border hover:bg-primary/4 transition-colors"
                >
                  <TableCell className="font-sans text-sm text-foreground">
                    {lead.name ? (
                      lead.name
                    ) : (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {lead.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] border-border text-muted-foreground"
                    >
                      {formatDate(lead.created_at)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-sans text-xs text-muted-foreground">
                    {formatDateTime(lead.last_sign_in_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
