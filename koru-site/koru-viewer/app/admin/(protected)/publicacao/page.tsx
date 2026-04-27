"use client"

import { useEffect, useMemo, useState } from "react"
import { useDocumentPublishing } from "@/hooks/use-document-publishing"
import { PublishConfig, PublishState, isPublic } from "@/lib/document-publish"

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

function StateButton({
  state,
  active,
  label,
  onClick,
}: {
  state: PublishState
  active: boolean
  label: string
  onClick: () => void
}) {
  const colors: Record<PublishState, { bg: string; border: string; fg: string }> = {
    published: { bg: "oklch(0.70 0.09 155 / 0.12)", border: "oklch(0.70 0.09 155 / 0.4)", fg: "oklch(0.70 0.09 155)" },
    scheduled: { bg: "oklch(0.72 0.08 75 / 0.12)", border: "oklch(0.72 0.08 75 / 0.4)", fg: "oklch(0.72 0.08 75)" },
    draft:     { bg: "oklch(0.58 0.01 280 / 0.18)", border: "oklch(0.58 0.01 280 / 0.5)", fg: "oklch(0.78 0.01 280)" },
  }
  const c = colors[state]
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-md font-sans text-xs transition-all"
      style={{
        background: active ? c.bg : "transparent",
        border: "1px solid " + (active ? c.border : "var(--border)"),
        color: active ? c.fg : "var(--muted-foreground)",
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </button>
  )
}

export default function PublicacaoPage() {
  const [groups, setGroups] = useState<DocGroup[]>([])
  const [personagens, setPersonagens] = useState<PersonagemEntry[]>([])
  const [docsLoaded, setDocsLoaded] = useState(false)
  const { configs, loaded: cfgLoaded, getConfig, setConfig } = useDocumentPublishing()
  const [savingPath, setSavingPath] = useState<string | null>(null)
  const [errorPath, setErrorPath] = useState<{ path: string; msg: string } | null>(null)

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((data) => {
        setGroups(data.groups ?? [])
        setPersonagens(data.personagens ?? [])
        setDocsLoaded(true)
      })
      .catch(() => setDocsLoaded(true))
  }, [])

  // Personagens use a virtual path "personagens/<slug>" since they aren't MD files.
  const personagemGroup: DocGroup = useMemo(() => ({
    section: "Personagens",
    color: "var(--accent)",
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
    return <div className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>Carregando…</div>
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl mb-2" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          Publicação
        </h1>
        <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
          Controla quais cards aparecem destrancados na home. Default = publicado.
          Cards em rascunho ou agendado-pra-frente aparecem com cadeado e não abrem.
        </p>
      </div>

      <div className="flex gap-3 mb-8">
        <div className="px-4 py-3 rounded-lg" style={{ background: "oklch(0.70 0.09 155 / 0.10)", border: "1px solid oklch(0.70 0.09 155 / 0.3)" }}>
          <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: "oklch(0.70 0.09 155)" }}>Publicados</div>
          <div className="font-serif text-2xl mt-0.5" style={{ color: "var(--foreground)" }}>{stats.pub}</div>
        </div>
        <div className="px-4 py-3 rounded-lg" style={{ background: "oklch(0.72 0.08 75 / 0.10)", border: "1px solid oklch(0.72 0.08 75 / 0.3)" }}>
          <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: "oklch(0.72 0.08 75)" }}>Agendados</div>
          <div className="font-serif text-2xl mt-0.5" style={{ color: "var(--foreground)" }}>{stats.sch}</div>
        </div>
        <div className="px-4 py-3 rounded-lg" style={{ background: "oklch(0.58 0.01 280 / 0.15)", border: "1px solid oklch(0.58 0.01 280 / 0.4)" }}>
          <div className="font-sans text-[10px] uppercase tracking-wider" style={{ color: "oklch(0.78 0.01 280)" }}>Rascunho</div>
          <div className="font-serif text-2xl mt-0.5" style={{ color: "var(--foreground)" }}>{stats.dft}</div>
        </div>
      </div>

      {allGroups.map((group) => (
        <section key={group.section} className="mb-10">
          <h2 className="font-sans text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "var(--muted-foreground)" }}>
            {group.section} <span style={{ opacity: 0.5 }}>· {group.docs.length}</span>
          </h2>
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
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
                    borderTop: idx === 0 ? "none" : "1px solid var(--border)",
                    opacity: visible ? 1 : 0.7,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-sm truncate" style={{ color: "var(--foreground)" }}>
                      {doc.label}
                    </div>
                    <div className="font-mono text-[10px] truncate" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
                      {doc.path}
                    </div>
                    {err && (
                      <div className="font-sans text-[11px] mt-1" style={{ color: "oklch(0.65 0.2 25)" }}>
                        Erro ao salvar: {err}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <StateButton
                      state="published"
                      active={cfg.state === "published"}
                      label="Publicado"
                      onClick={() => applyConfig(doc.path, { state: "published", at: null })}
                    />
                    <StateButton
                      state="scheduled"
                      active={cfg.state === "scheduled"}
                      label="Agendar"
                      onClick={() => {
                        const fallback = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                        applyConfig(doc.path, { state: "scheduled", at: cfg.at ?? fallback })
                      }}
                    />
                    <StateButton
                      state="draft"
                      active={cfg.state === "draft"}
                      label="Rascunho"
                      onClick={() => applyConfig(doc.path, { state: "draft", at: null })}
                    />
                  </div>

                  {cfg.state === "scheduled" && (
                    <div className="shrink-0">
                      <input
                        type="datetime-local"
                        value={toDatetimeLocal(cfg.at)}
                        onChange={(e) => {
                          const iso = fromDatetimeLocal(e.target.value)
                          applyConfig(doc.path, { state: "scheduled", at: iso })
                        }}
                        className="rounded px-2 py-1 font-sans text-xs"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          color: "var(--foreground)",
                        }}
                      />
                      {cfg.at && (
                        <div className="font-sans text-[10px] mt-0.5 text-right" style={{ color: "oklch(0.72 0.08 75)" }}>
                          libera em {formatRelease(cfg.at)}
                        </div>
                      )}
                    </div>
                  )}

                  {saving && (
                    <span className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>salvando…</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
