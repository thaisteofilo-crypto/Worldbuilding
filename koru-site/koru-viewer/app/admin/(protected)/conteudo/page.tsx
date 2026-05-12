"use client"

import { useEffect, useState } from "react"

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
      { key: "hero.cta_primary_text", label: "Botão primário: Texto" },
      { key: "hero.cta_primary_href", label: "Botão primário: Link" },
      { key: "hero.cta_secondary_text", label: "Botão secundário: Texto" },
      { key: "hero.cta_secondary_href", label: "Botão secundário: Link" },
    ],
  },
  {
    id: "sections",
    title: "Seções da Homepage",
    color: "oklch(0.48 0.12 65)",
    fields: [
      { key: "section.personagens.label", label: "Personagens: Label" },
      { key: "section.personagens.title", label: "Personagens: Título" },
      { key: "section.biblia.label", label: "Bíblia: Label" },
      { key: "section.biblia.title", label: "Bíblia: Título" },
      { key: "section.livro.label", label: "Livro: Label" },
      { key: "section.livro.title", label: "Livro: Título" },
      { key: "section.contos.label", label: "Contos: Label" },
      { key: "section.contos.title", label: "Contos: Título" },
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
    title: "Bíblia: Títulos dos Cards",
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
    title: "Livro: Títulos dos Cards",
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
  onSave,
}: {
  label: string
  value: string
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

  if (editing) {
    return (
      <div>
        <p
          className="font-sans text-[10px] tracking-[0.12em] uppercase"
          style={{ color: "var(--muted-foreground)" }}
        >
          {label}
        </p>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          className="mt-1 w-full rounded px-2 py-1 font-sans text-xs outline-none"
          style={{
            background: "var(--background)",
            border: "1px solid var(--foreground)",
            color: "var(--foreground)",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") save()
            if (e.key === "Escape") cancel()
          }}
        />
        <div className="mt-1 flex gap-1">
          <button
            onClick={save}
            disabled={saving}
            className="rounded px-2 py-0.5 font-sans text-[10px] uppercase"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            {saving ? "..." : "Salvar"}
          </button>
          <button
            onClick={cancel}
            className="rounded px-2 py-0.5 font-sans text-[10px] uppercase"
            style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-[var(--surface)]"
      onClick={startEdit}
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
        <span>{value || <span style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>vazio</span>}</span>
        {saved && (
          <span className="font-sans text-[10px]" style={{ color: "oklch(0.45 0.12 150)" }}>
            salvo
          </span>
        )}
        <span className="inline-block opacity-0 transition-opacity group-hover:opacity-50">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
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
    <div className="rounded-xl glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors"
        style={{ background: "color-mix(in oklch, var(--surface) 80%, transparent)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: group.color }}
          />
          <span
            className="font-sans text-xs tracking-[0.15em] uppercase font-medium"
            style={{ color: "var(--foreground)" }}
          >
            {group.title}
          </span>
          <span
            className="font-sans text-[10px]"
            style={{ color: "var(--muted-foreground)" }}
          >
            {group.fields.length} campo{group.fields.length !== 1 ? "s" : ""}
          </span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: "var(--muted-foreground)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Fields */}
      {open && (
        <div
          className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {group.fields.map((field) => (
            <EditableField
              key={field.key}
              label={field.label}
              value={content[field.key] ?? DEFAULTS[field.key] ?? ""}
              onSave={(val) => onSave(field.key, val)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─── */

export default function ConteudoPage() {
  const [content, setContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
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
        // Fall back to defaults on network error
        setContent({ ...DEFAULTS })
        setError("Não foi possível carregar do banco. Usando valores padrão.")
        setLoading(false)
      })
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
          "Salvo localmente, mas o banco rejeitou a escrita. Verifique a tabela `site_content` e a SUPABASE_SERVICE_ROLE_KEY (o site público pode mostrar valor antigo)."
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
        <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
          Conteúdo do Site
        </h1>
        <div className="mt-8 flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--foreground)" }}
          />
          <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
            Carregando...
          </p>
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
        {error && (
          <p
            className="mt-2 font-sans text-xs rounded-lg px-3 py-2 inline-block"
            style={{
              color: "oklch(0.55 0.18 27)",
              background: "oklch(0.55 0.18 27 / 0.08)",
              border: "1px solid oklch(0.55 0.18 27 / 0.2)",
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

      {/* Footer hint */}
      <p
        className="mt-6 font-sans text-[11px] text-center"
        style={{ color: "var(--muted-foreground)", opacity: 0.6 }}
      >
        Clique em qualquer campo para editar. As alterações são salvas imediatamente no banco.
      </p>
    </div>
  )
}
