"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { ChevronDown, ExternalLink, Pencil } from "lucide-react"

/* ─── Types ─── */

interface ContentRow {
  key: string
  value: string
  updated_at?: string
}

/* ─── Default fallbacks (mirrors lib/site-content.ts DEFAULTS) ─── */

const DEFAULTS: Record<string, string> = {
  "hero.tagline": "Um mundo cuja física é baseada em memória.",
  "hero.cta_primary_text": "Bíblia do Mundo",
  "hero.cta_primary_href": "/biblia/parte-00",
  "hero.cta_secondary_text": "O Livro",
  "hero.cta_secondary_href": "/livro/01",
  "section.personagens.label": "Personagens",
  "section.personagens.title": "Os seres do Akwu",
  "section.biblia.label": "Bíblia do Mundo",
  "section.biblia.title": "O arquivo vivo",
  "section.livro.label": "Livro",
  "section.livro.title": "O Peso da Luz",
  "section.contos.label": "Contos",
  "section.contos.title": "Vozes do Akwu",
  "footer.copyright": "Todos os direitos reservados a Thaís Teófilo",
  "biblia.manifesto.title": "Propósito · Manifesto",
  "biblia.parte-00.title": "Introdução · A Língua de Korú",
  "biblia.parte-01.title": "Física · A Natureza do Akwu",
  "biblia.parte-02.title": "Geografia · Ikwe e seus Lugares",
  "biblia.parte-03.title": "Ecossistema · O Ciclo da Memória",
  "biblia.parte-04.title": "Criaturas · Os Seres de Korú",
  "biblia.parte-05.title": "Personagens · Quem Habita",
  "biblia.parte-06.title": "Regras · Os 13 Acordos",
  "biblia.parte-07.title": "Cultura · Como se Vive",
  "biblia.parte-08.title": "Linha do Tempo · As Seis Eras",
  "biblia.glossario-de-koru.title": "Glossário de Korú",
  "biblia.glossario-de-lugares.title": "Glossário de Lugares",
  "livro.01.title": "O que ela é",
  "livro.02.title": "Manhãs",
  "livro.03.title": "A cidade",
  "livro.04.title": "A mentira silenciosa",
  "livro.05.title": "Entre o lilás e o cinza",
  "livro.06.title": "O que a floresta guarda",
  "livro.07.title": "O projeto do fim do luto",
  "livro.08.title": "A chuva",
  "livro.09.title": "O limiar como morada",
  "livro.10.title": "A noite antes",
  "livro.11.title": "O que ela paga",
  "livro.12.title": "O retorno",
  "livro.epilogo.title": "Epílogo",
}

/* ─── Groups definition ─── */

interface FieldDef {
  key: string
  label: string
  /** Campo de link: ativa validação de URL e renderização como link clicável */
  isLink?: boolean
}

/* ─── URL helpers (campos de link) ─── */

/** Aceita URLs absolutas http/https e caminhos relativos começando com "/" */
function isValidLinkValue(value: string): boolean {
  if (!value) return true // vazio não é "inválido" — só não vira link
  if (value.startsWith("/")) return true
  if (/^https?:\/\//i.test(value)) {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }
  return false
}

function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

interface GroupDef {
  id: string
  title: string
  color: string
  fields: FieldDef[]
}

const GROUPS: GroupDef[] = [
  {
    id: "hero",
    title: "Hero",
    color: "oklch(0.45 0.12 290)",
    fields: [
      { key: "hero.tagline", label: "Tagline principal" },
      { key: "hero.cta_primary_text", label: "Botão primário — Texto" },
      { key: "hero.cta_primary_href", label: "Botão primário — Link", isLink: true },
      { key: "hero.cta_secondary_text", label: "Botão secundário — Texto" },
      { key: "hero.cta_secondary_href", label: "Botão secundário — Link", isLink: true },
    ],
  },
  {
    id: "sections",
    title: "Seções da Homepage",
    color: "oklch(0.48 0.12 65)",
    fields: [
      { key: "section.personagens.label", label: "Personagens — Label" },
      { key: "section.personagens.title", label: "Personagens — Título" },
      { key: "section.biblia.label", label: "Bíblia — Label" },
      { key: "section.biblia.title", label: "Bíblia — Título" },
      { key: "section.livro.label", label: "Livro — Label" },
      { key: "section.livro.title", label: "Livro — Título" },
      { key: "section.contos.label", label: "Contos — Label" },
      { key: "section.contos.title", label: "Contos — Título" },
    ],
  },
  {
    id: "footer",
    title: "Rodapé",
    color: "oklch(0.42 0.10 230)",
    fields: [
      { key: "footer.copyright", label: "Texto de copyright" },
    ],
  },
  {
    id: "biblia",
    title: "Bíblia — Títulos dos Cards",
    color: "oklch(0.48 0.12 65)",
    fields: [
      { key: "biblia.manifesto.title", label: "Manifesto" },
      { key: "biblia.parte-00.title", label: "Parte 00" },
      { key: "biblia.parte-01.title", label: "Parte 01" },
      { key: "biblia.parte-02.title", label: "Parte 02" },
      { key: "biblia.parte-03.title", label: "Parte 03" },
      { key: "biblia.parte-04.title", label: "Parte 04" },
      { key: "biblia.parte-05.title", label: "Parte 05" },
      { key: "biblia.parte-06.title", label: "Parte 06" },
      { key: "biblia.parte-07.title", label: "Parte 07" },
      { key: "biblia.parte-08.title", label: "Parte 08" },
      { key: "biblia.glossario-de-koru.title", label: "Glossário de Korú" },
      { key: "biblia.glossario-de-lugares.title", label: "Glossário de Lugares" },
    ],
  },
  {
    id: "livro",
    title: "Livro — Títulos dos Cards",
    color: "oklch(0.42 0.10 230)",
    fields: [
      { key: "livro.01.title", label: "Capítulo 1" },
      { key: "livro.02.title", label: "Capítulo 2" },
      { key: "livro.03.title", label: "Capítulo 3" },
      { key: "livro.04.title", label: "Capítulo 4" },
      { key: "livro.05.title", label: "Capítulo 5" },
      { key: "livro.06.title", label: "Capítulo 6" },
      { key: "livro.07.title", label: "Capítulo 7" },
      { key: "livro.08.title", label: "Capítulo 8" },
      { key: "livro.09.title", label: "Capítulo 9" },
      { key: "livro.10.title", label: "Capítulo 10" },
      { key: "livro.11.title", label: "Capítulo 11" },
      { key: "livro.12.title", label: "Capítulo 12" },
      { key: "livro.epilogo.title", label: "Epílogo" },
    ],
  },
]

/* ─── EditableField ─── */

function EditableField({
  label,
  value,
  isLink = false,
  onSave,
}: {
  label: string
  value: string
  isLink?: boolean
  onSave: (newValue: string) => Promise<{ ok: boolean }>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Keep draft in sync when value changes from parent
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  function startEdit() {
    setDraft(value)
    setEditing(true)
    setSaved(false)
  }

  async function save() {
    if (draft === value) {
      setEditing(false)
      return
    }
    setSaving(true)
    const result = await onSave(draft)
    setSaving(false)
    setEditing(false)
    if (result.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  function cancel() {
    setDraft(value)
    setEditing(false)
  }

  const linkInvalid = isLink && !isValidLinkValue(draft)

  if (editing) {
    return (
      <div>
        <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
          {label}
        </p>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          className="mt-1 font-sans text-xs h-7"
          style={
            linkInvalid
              ? { borderColor: "color-mix(in oklch, oklch(0.7 0.14 70) 60%, transparent)" }
              : undefined
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") save()
            if (e.key === "Escape") cancel()
          }}
        />
        {linkInvalid && (
          <p
            className="mt-1 font-sans text-[10px] leading-snug"
            style={{ color: "oklch(0.7 0.14 70)" }}
          >
            Link fora do formato esperado — use http(s):// ou um caminho começando com /. Você ainda pode salvar.
          </p>
        )}
        <div className="mt-1 flex gap-1">
          <Button
            onClick={save}
            disabled={saving}
            size="xs"
            className="rounded-full uppercase"
          >
            {saving ? "..." : "Salvar"}
          </Button>
          <Button
            onClick={cancel}
            variant="outline"
            size="xs"
            className="rounded-full uppercase"
          >
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  const renderAsLink = isLink && !!value && isValidLinkValue(value)
  const external = renderAsLink && isExternalUrl(value)

  return (
    <div
      className="group cursor-pointer rounded border border-transparent px-1 py-0.5 transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)]"
      onClick={startEdit}
      title="Clique para editar"
    >
      <p
        className="font-sans text-[10px] tracking-[0.12em] uppercase"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </p>
      <p
        className="mt-0.5 font-sans text-xs leading-relaxed flex items-center gap-1"
        style={{ color: "var(--foreground)" }}
      >
        {renderAsLink ? (
          <a
            href={value}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 underline underline-offset-2 transition-opacity hover:opacity-75"
            style={{ color: "var(--foreground)", textDecorationColor: "var(--muted-foreground)" }}
            title={external ? "Abrir em nova aba" : "Abrir link"}
          >
            <span>{value}</span>
            {external && <ExternalLink size={10} className="shrink-0" />}
          </a>
        ) : (
          <span>{value || <span style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>vazio</span>}</span>
        )}
        {saved && (
          <span className="font-sans text-[10px]" style={{ color: "oklch(0.65 0.15 150)" }}>
            salvo
          </span>
        )}
        <span className="inline-block opacity-0 transition-opacity group-hover:opacity-100">
          <Pencil size={10} className="inline" style={{ color: "var(--muted-foreground)" }} />
        </span>
      </p>
    </div>
  )
}

/* ─── CollapsibleGroup ─── */

function CollapsibleGroup({
  group,
  content,
  onSave,
}: {
  group: GroupDef
  content: Record<string, string>
  onSave: (key: string, value: string) => Promise<{ ok: boolean }>
}) {
  const [open, setOpen] = useState(true)

  return (
    <GlassCard className="overflow-hidden">
      {/* Header */}
      <Button
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 h-auto rounded-none transition-colors"
        style={{ background: "color-mix(in oklch, var(--surface) 80%, transparent)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: group.color }}
          />
          <span className="font-sans text-xs tracking-[0.15em] uppercase font-medium text-foreground">
            {group.title}
          </span>
          <span className="font-sans text-[10px] text-muted-foreground">
            {group.fields.length} campo{group.fields.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ChevronDown
          size={14}
          className="text-muted-foreground transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </Button>

      {/* Fields */}
      {open && (
        <GlassCardContent
          className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {group.fields.map((field) => (
            <EditableField
              key={field.key}
              label={field.label}
              value={content[field.key] ?? DEFAULTS[field.key] ?? ""}
              isLink={field.isLink}
              onSave={(val) => onSave(field.key, val)}
            />
          ))}
        </GlassCardContent>
      )}
    </GlassCard>
  )
}

/* ─── Main Page ─── */

export default function ConteudoPage() {
  const [content, setContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setContent({ ...DEFAULTS })
      setError("O servidor demorou mais de 10s para responder. Usando valores padrão.")
      setLoading(false)
    }, 10000)

    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        clearTimeout(timeout)
        // Convert array of {key, value} rows into a map
        const map: Record<string, string> = { ...DEFAULTS }
        for (const row of data.content ?? []) {
          if (row.key && row.value !== null) {
            map[row.key] = row.value
          }
        }
        setContent(map)
        setLoading(false)
      })
      .catch(() => {
        clearTimeout(timeout)
        // Fall back to defaults on network error
        setContent({ ...DEFAULTS })
        setError("Não foi possível carregar do banco. Usando valores padrão.")
        setLoading(false)
      })

    return () => clearTimeout(timeout)
  }, [])

  async function handleSave(key: string, value: string): Promise<{ ok: boolean }> {
    try {
      const res = await fetch("/api/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
      if (!res.ok) {
        setError("Falha ao salvar. O valor não foi persistido.")
        return { ok: false }
      }
      const json = await res.json().catch(() => ({}))
      // O endpoint devolve ok mesmo quando o Supabase falha silenciosamente
      // (em dev, o arquivo local cobre). Avisamos para que o público em
      // produção não fique com valor desatualizado.
      if (json && json.supabaseOk === false) {
        setError(
          "Salvo localmente, mas o banco rejeitou a escrita. Verifique a tabela `site_content` e a SUPABASE_SERVICE_ROLE_KEY — o site público pode mostrar valor antigo."
        )
      } else {
        setError(null)
      }
      // Update local state immediately
      setContent((prev) => ({ ...prev, [key]: value }))
      return { ok: true }
    } catch {
      setError("Erro de rede ao salvar.")
      return { ok: false }
    }
  }

  if (loading) {
    return (
      <div>
        {/* Page header skeleton */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
            Conteúdo do Site
          </h1>
          <div className="mt-1">
            <Skeleton className="h-3 w-64" />
          </div>
        </div>

        {/* Group skeletons — one per GROUPS entry */}
        <div className="flex flex-col gap-4">
          {GROUPS.map((group) => (
            <GlassCard key={group.id} className="overflow-hidden animate-pulse">
              {/* Header bar */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{ background: "color-mix(in oklch, var(--surface) 80%, transparent)" }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: group.color, opacity: 0.5 }} />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-12 opacity-50" />
              </div>
              {/* Fields placeholder */}
              <GlassCardContent
                className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                {group.fields.slice(0, Math.min(group.fields.length, 4)).map((f) => (
                  <div key={f.key}>
                    <Skeleton className="h-2 w-24 mb-1.5 opacity-60" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
          Conteúdo do Site
        </h1>
        <p className="mt-1 font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
          Edite textos da homepage sem tocar no código.
        </p>
        <p
          className="mt-2 font-sans text-xs rounded-lg px-3 py-2 inline-flex items-center gap-2"
          style={{
            color: "var(--muted-foreground)",
            background: "color-mix(in oklch, var(--surface) 70%, transparent)",
            border: "1px solid var(--border)",
          }}
        >
          <Pencil size={11} className="shrink-0" />
          Clique em qualquer campo para editar. As alterações são salvas imediatamente no banco.
        </p>
        {error && (
          <p
            className="mt-2 font-sans text-xs rounded-lg px-3 py-2 inline-block"
            style={{
              color: "var(--destructive)",
              background: "color-mix(in oklch, var(--destructive) 8%, transparent)",
              border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Groups */}
      <div className="flex flex-col gap-4">
        {GROUPS.map((group) => (
          <CollapsibleGroup
            key={group.id}
            group={group}
            content={content}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  )
}
