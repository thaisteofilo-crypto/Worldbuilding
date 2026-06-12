"use client"

import { useEffect, useMemo, useState } from "react"
import { useDocumentPublishing } from "@/hooks/use-document-publishing"
import { PublishConfig, PublishState, isPublic } from "@/lib/document-publish"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

interface DocEntry { label: string; path: string }
interface DocGroup { section: string; color: string; docs: DocEntry[] }
interface PersonagemEntry { slug: string; title: string }

function formatRelease(at: string | null | undefined): string {
  if (!at) return ""
  const d = new Date(at)
  if (isNaN(d.getTime())) return ""
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    d.getFullYear() +
    "-" + pad(d.getMonth() + 1) +
    "-" + pad(d.getDate()) +
    "T" + pad(d.getHours()) +
    ":" + pad(d.getMinutes())
  )
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null
  const d = new Date(value)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

const STATE_COLORS: Record<PublishState, { bg: string; border: string; fg: string }> = {
  published: { bg: "color-mix(in srgb, var(--color-mata) 12%, transparent)", border: "color-mix(in srgb, var(--color-mata) 40%, transparent)", fg: "var(--color-mata)" },
  scheduled: { bg: "color-mix(in srgb, var(--color-mel) 12%, transparent)", border: "color-mix(in srgb, var(--color-mel) 40%, transparent)", fg: "var(--color-mel)" },
  draft:     { bg: "hsl(var(--muted-foreground) / 0.12)", border: "hsl(var(--muted-foreground) / 0.4)", fg: "hsl(var(--muted-foreground))" },
}

function StateButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  // Estado selecionado: preenchido com a cor primária + check, claramente
  // distinto das ações não selecionadas (outline). Evita clique acidental.
  return (
    <Button
      type="button"
      onClick={onClick}
      variant={active ? "default" : "outline"}
      size="xs"
      className="rounded-md font-sans"
      aria-pressed={active}
      style={active ? { fontWeight: 600 } : undefined}
    >
      {active && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {label}
    </Button>
  )
}

export default function PublicacaoPage() {
  const [groups, setGroups] = useState<DocGroup[]>([])
  const [personagens, setPersonagens] = useState<PersonagemEntry[]>([])
  const [docsLoaded, setDocsLoaded] = useState(false)
  const { configs, loaded: cfgLoaded, getConfig, setConfig } = useDocumentPublishing()
  const [savingPath, setSavingPath] = useState<string | null>(null)
  const [errorPath, setErrorPath] = useState<{ path: string; msg: string } | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDocsLoaded(true)
      setLoadError("O servidor demorou mais de 10s para responder. Os documentos podem não ter carregado.")
    }, 10000)

    fetch("/api/docs")
      .then((r) => r.json())
      .then((data) => {
        clearTimeout(timeout)
        setGroups(data.groups ?? [])
        setPersonagens(data.personagens ?? [])
        setDocsLoaded(true)
      })
      .catch(() => {
        clearTimeout(timeout)
        setDocsLoaded(true)
      })

    return () => clearTimeout(timeout)
  }, [])

  // Personagens use a virtual path "personagens/<slug>" since they aren't MD files.
  const personagemGroup: DocGroup = useMemo(() => ({
    section: "Personagens",
    color: "hsl(var(--primary))",
    docs: personagens.map((p) => ({ label: p.title, path: `personagens/${p.slug}` })),
  }), [personagens])

  const allGroups = useMemo(() => {
    // Personagens between Bíblia and Livro to mirror the home page order.
    const biblia = groups.find((g) => g.section === "Bíblia")
    const livro = groups.find((g) => g.section === "Livro")
    const contos = groups.find((g) => g.section === "Contos")
    return [biblia, personagemGroup, contos, livro].filter((g): g is DocGroup => !!g)
  }, [groups, personagemGroup])

  const stats = useMemo(() => {
    let pub = 0, sch = 0, dft = 0
    const now = new Date()
    for (const g of allGroups) {
      for (const d of g.docs) {
        const cfg = getConfig(d.path)
        if (cfg.state === "published") pub++
        else if (cfg.state === "scheduled") {
          if (isPublic(cfg, now)) pub++
          else sch++
        }
        else dft++
      }
    }
    return { pub, sch, dft }
  }, [allGroups, configs, getConfig])

  async function applyConfig(path: string, next: PublishConfig) {
    setSavingPath(path)
    setErrorPath(null)
    try {
      await setConfig(path, next)
    } catch (err) {
      setErrorPath({ path, msg: err instanceof Error ? err.message : String(err) })
    } finally {
      setSavingPath(null)
    }
  }

  if (!docsLoaded || !cfgLoaded) {
    return (
      <div className="max-w-5xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-3 w-96 opacity-60" />
        </div>

        {/* Stats cards skeleton */}
        <div className="flex gap-3 mb-8">
          {[
            "color-mix(in srgb, var(--color-mata) 10%, transparent)",
            "color-mix(in srgb, var(--color-mel) 10%, transparent)",
            "hsl(var(--muted-foreground) / 0.10)",
          ].map((bg, i) => (
            <Card
              key={i}
              className="px-4 py-3"
              style={{ background: bg, minWidth: "96px" }}
            >
              <Skeleton className="h-2 w-16 mb-2 opacity-15" />
              <Skeleton className="h-7 w-8 opacity-15" />
            </Card>
          ))}
        </div>

        {/* Group list skeletons — 4 sections */}
        {[12, 7, 8, 13].map((count, gi) => (
          <section key={gi} className="mb-10">
            <Skeleton className="h-2 w-24 mb-3" />
            <Card className="overflow-hidden">
              {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: i === 0 ? "none" : "1px solid hsl(var(--border-shadcn))" }}
                >
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-3.5 w-48 mb-1 opacity-8" />
                    <Skeleton className="h-2.5 w-32 opacity-5" />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Skeleton className="h-6 w-20 rounded-md opacity-6" />
                    <Skeleton className="h-6 w-16 rounded-md opacity-6" />
                    <Skeleton className="h-6 w-20 rounded-md opacity-6" />
                  </div>
                </div>
              ))}
            </Card>
          </section>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl mb-2" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          Publicação
        </h1>
        <p className="font-sans text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Controla quais cards aparecem destrancados na home. Default = publicado.
          Cards em rascunho ou agendado-pra-frente aparecem com cadeado e não abrem.
        </p>
        {loadError && (
          <p
            className="mt-2 font-sans text-xs rounded-lg px-3 py-2 inline-block"
            style={{
              color: "hsl(var(--destructive))",
              background: "hsl(var(--destructive) / 0.08)",
              border: "1px solid hsl(var(--destructive) / 0.25)",
            }}
          >
            {loadError}
          </p>
        )}
      </div>

      <div className="flex gap-3 mb-8">
        <Card className="px-4 py-3" style={{ background: STATE_COLORS.published.bg, borderColor: "color-mix(in srgb, var(--color-mata) 30%, transparent)" }}>
          <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: STATE_COLORS.published.fg }}>Publicados</div>
          <div className="font-serif text-2xl mt-0.5" style={{ color: "hsl(var(--foreground))" }}>{stats.pub}</div>
        </Card>
        <Card className="px-4 py-3" style={{ background: STATE_COLORS.scheduled.bg, borderColor: "color-mix(in srgb, var(--color-mel) 30%, transparent)" }}>
          <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: STATE_COLORS.scheduled.fg }}>Agendados</div>
          <div className="font-serif text-2xl mt-0.5" style={{ color: "hsl(var(--foreground))" }}>{stats.sch}</div>
        </Card>
        <Card className="px-4 py-3" style={{ background: STATE_COLORS.draft.bg, borderColor: "hsl(var(--muted-foreground) / 0.3)" }}>
          <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: STATE_COLORS.draft.fg }}>Rascunho</div>
          <div className="font-serif text-2xl mt-0.5" style={{ color: "hsl(var(--foreground))" }}>{stats.dft}</div>
        </Card>
      </div>

      {allGroups.map((group) => (
        <section key={group.section} className="mb-10">
          <h2 className="font-sans text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
            {group.section} <span style={{ opacity: 0.5 }}>· {group.docs.length}</span>
          </h2>
          <Card className="overflow-hidden">
            {group.docs.map((doc, idx) => {
              const cfg = getConfig(doc.path)
              const saving = savingPath === doc.path
              const err = errorPath?.path === doc.path ? errorPath.msg : null
              const visible = isPublic(cfg)
              return (
                <div
                  key={doc.path}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    borderTop: idx === 0 ? "none" : "1px solid hsl(var(--border-shadcn))",
                    opacity: visible ? 1 : 0.7,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-sm truncate" style={{ color: "hsl(var(--foreground))" }}>
                      {doc.label}
                    </div>
                    <div className="font-mono text-[10px] truncate" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.6 }}>
                      {doc.path}
                    </div>
                    {err && (
                      <div className="font-sans text-[11px] mt-1" style={{ color: "hsl(var(--destructive))" }}>
                        Erro ao salvar: {err}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <StateButton
                      active={cfg.state === "published"}
                      label="Publicado"
                      onClick={() => applyConfig(doc.path, { state: "published", at: null })}
                    />
                    <StateButton
                      active={cfg.state === "scheduled"}
                      label="Agendar"
                      onClick={() => {
                        const fallback = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                        applyConfig(doc.path, { state: "scheduled", at: cfg.at ?? fallback })
                      }}
                    />
                    <StateButton
                      active={cfg.state === "draft"}
                      label="Rascunho"
                      onClick={() => applyConfig(doc.path, { state: "draft", at: null })}
                    />
                  </div>

                  {cfg.state === "scheduled" && (
                    <div className="shrink-0">
                      <Input
                        type="datetime-local"
                        value={toDatetimeLocal(cfg.at)}
                        onChange={(e) => {
                          const iso = fromDatetimeLocal(e.target.value)
                          applyConfig(doc.path, { state: "scheduled", at: iso })
                        }}
                        className="font-sans text-xs h-7 w-auto"
                      />
                      {cfg.at && (
                        <div className="font-sans text-[10px] mt-0.5 text-right" style={{ color: STATE_COLORS.scheduled.fg }}>
                          libera em {formatRelease(cfg.at)}
                        </div>
                      )}
                    </div>
                  )}

                  {saving && (
                    <span className="font-sans text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>salvando…</span>
                  )}
                </div>
              )
            })}
          </Card>
        </section>
      ))}
    </div>
  )
}
