"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Upload, Eye, Pencil, ExternalLink, CheckCircle2, Loader2 } from "lucide-react"
import { CardCarousel } from "@/components/koru/card-carousel"

// ---------------------------------------------------------------------------
// Color maps (identical to app/page.tsx)
// ---------------------------------------------------------------------------

const BIBLIA_COLORS: Record<string, string> = {
  "manifesto":            "#E99000",
  "parte-00-manifesto":   "#E99000",
  "parte-00":             "#9B6C22",
  "parte-01":             "#707C36",
  "parte-02":             "#8B3D17",
  "parte-03":             "#707C36",
  "parte-04":             "#C72211",
  "parte-05":             "#BF505C",
  "parte-06":             "#9B6C22",
  "parte-07":             "#E99000",
  "parte-08":             "#8B3D17",
  "glossario-de-koru":    "#DD560D",
  "glossario-de-lugares": "#707C36",
}
function bibliaColor(slug: string): string {
  const key = slug.replace(/^parte-(\d+).*/, "parte-$1")
  return BIBLIA_COLORS[slug] ?? BIBLIA_COLORS[key] ?? "#9B6C22"
}

const CHAR_COLORS: Record<string, string> = {
  temiku: "#BF505C",
  amara:  "#707C36",
  oruku:  "#9B6C22",
  beku:   "#8B3D17",
  obaru:  "#C72211",
  kemdi:  "#DD560D",
  temi:   "#E99000",
  orike:  "#707C36",
  kairo:  "#BF505C",
}
function charColor(slug: string): string {
  return CHAR_COLORS[slug] ?? "#9B6C22"
}

const LIVRO_COLORS: Record<string, string> = {
  "01": "#C72211", "02": "#DD560D", "03": "#BF505C", "04": "#707C36",
  "05": "#9B6C22", "06": "#8B3D17", "07": "#E99000", "08": "#C72211",
  "09": "#DD560D", "10": "#BF505C", "11": "#707C36", "12": "#9B6C22",
  epilogo: "#E99000",
}
function livroColor(slug: string): string {
  return LIVRO_COLORS[slug] ?? "#9B6C22"
}

// ---------------------------------------------------------------------------
// Slug lists
// ---------------------------------------------------------------------------

const BIBLIA_SLUGS = [
  "parte-00-manifesto", "parte-01-fisica-cosmologia", "parte-02-geografia",
  "parte-03-ecossistema", "parte-04-criaturas", "parte-05-personagens",
  "parte-06-regras", "parte-07-cultura", "parte-08-linha-do-tempo",
  "glossario-de-koru", "glossario-de-lugares",
]

const LIVRO_SLUGS = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12", "epilogo",
]

// ---------------------------------------------------------------------------
// Default content values
// ---------------------------------------------------------------------------

const SECTION_DEFAULTS: Record<string, string> = {
  "hero.tagline":                    "Um mundo cuja física é baseada em memória.",
  "section.biblia.label":            "Bíblia do Mundo",
  "section.biblia.title":            "O arquivo vivo",
  "section.biblia.description":      "A física, a cosmologia, as criaturas e os acordos que sustentam o Akwu.",
  "section.personagens.label":       "Personagens",
  "section.personagens.title":       "Os seres do Akwu",
  "section.personagens.description": "Cada ser carrega memória em substâncias diferentes.",
  "section.contos.label":            "Contos",
  "section.contos.title":            "Vozes do Akwu",
  "section.contos.description":      "Sete histórias. Sete formas de habitar o mesmo mundo.",
  "section.livro.label":             "Livro",
  "section.livro.title":             "O Peso da Luz",
  "section.livro.description":       "A história de Temiku, em doze capítulos.",
  "footer.copyright":                "© Thaís Teófilo · Todos os direitos reservados",
  "biblia.parte-00-manifesto.title":         "Introdução · A Língua de Korú",
  "biblia.parte-01-fisica-cosmologia.title": "Física · A Natureza do Akwu",
  "biblia.parte-02-geografia.title":         "Geografia · Ikwe e seus Lugares",
  "biblia.parte-03-ecossistema.title":       "Ecossistema · O Ciclo da Memória",
  "biblia.parte-04-criaturas.title":         "Criaturas · Os Seres de Korú",
  "biblia.parte-05-personagens.title":       "Personagens · Quem Habita",
  "biblia.parte-06-regras.title":            "Regras · Os 13 Acordos",
  "biblia.parte-07-cultura.title":           "Cultura · Como se Vive",
  "biblia.parte-08-linha-do-tempo.title":    "Linha do Tempo · As Seis Eras",
  "biblia.glossario-de-koru.title":          "Glossário de Korú",
  "biblia.glossario-de-lugares.title":       "Glossário de Lugares",
  "livro.01.title":     "O que ela é",
  "livro.02.title":     "Manhãs",
  "livro.03.title":     "A cidade",
  "livro.04.title":     "A mentira silenciosa",
  "livro.05.title":     "Entre o lilás e o cinza",
  "livro.06.title":     "O que a floresta guarda",
  "livro.07.title":     "O projeto do fim do luto",
  "livro.08.title":     "A chuva",
  "livro.09.title":     "O limiar como morada",
  "livro.10.title":     "A noite antes",
  "livro.11.title":     "O que ela paga",
  "livro.12.title":     "O retorno",
  "livro.epilogo.title": "Epílogo",
}

// ---------------------------------------------------------------------------
// InlineEdit
// ---------------------------------------------------------------------------

interface InlineEditProps {
  as?: keyof JSX.IntrinsicElements
  value: string
  contentKey: string
  onSave: (key: string, value: string) => Promise<void>
  isEditing: boolean
  multiline?: boolean
  className?: string
  style?: React.CSSProperties
}

function InlineEdit({
  as: Tag = "span",
  value,
  contentKey,
  onSave,
  isEditing,
  multiline = false,
  className,
  style,
}: InlineEditProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (!open) setDraft(value)
  }, [value, open])

  if (!isEditing) {
    return (
      <Tag style={style} className={className}>
        {value}
      </Tag>
    )
  }

  if (open) {
    const inputStyle: React.CSSProperties = {
      ...style,
      background: "color-mix(in oklch, var(--surface, oklch(0.12 0.008 280)) 80%, transparent)",
      border: "1.5px solid var(--accent, oklch(0.65 0.18 50))",
      borderRadius: 4,
      outline: "none",
      width: "100%",
      padding: "2px 6px",
      fontFamily: "inherit",
      fontSize: "inherit",
      fontWeight: "inherit",
      letterSpacing: "inherit",
      lineHeight: "inherit",
      color: "inherit",
    }

    if (multiline) {
      return (
        <textarea
          rows={3}
          style={{ ...inputStyle, resize: "vertical" } as React.CSSProperties}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            setOpen(false)
            if (draft !== value) onSave(contentKey, draft)
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setDraft(value); setOpen(false) }
          }}
          autoFocus
        />
      )
    }

    return (
      <input
        type="text"
        style={inputStyle}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setOpen(false)
          if (draft !== value) onSave(contentKey, draft)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { setOpen(false); if (draft !== value) onSave(contentKey, draft) }
          if (e.key === "Escape") { setDraft(value); setOpen(false) }
        }}
        autoFocus
      />
    )
  }

  return (
    <Tag
      style={{
        ...style,
        cursor: "text",
        outline: "1px dashed color-mix(in oklch, var(--accent, oklch(0.65 0.18 50)) 40%, transparent)",
        outlineOffset: 2,
        borderRadius: 2,
      }}
      className={className}
      onClick={() => { setDraft(value); setOpen(true) }}
    >
      {value || <span style={{ opacity: 0.4 }}>clique para editar</span>}
    </Tag>
  )
}

// ---------------------------------------------------------------------------
// CardWithUpload
// ---------------------------------------------------------------------------

interface CardWithUploadProps {
  color: string
  title: string
  titleKey: string
  kicker?: string
  isEditing: boolean
  onSave: (key: string, value: string) => Promise<void>
  cardKey: string
  uploadedImage?: string
  onUpload: (file: File, key: string) => Promise<void>
}

function CardWithUpload({
  color, title, titleKey, kicker, isEditing, onSave, cardKey, uploadedImage, onUpload,
}: CardWithUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) await onUpload(file, cardKey)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div
      className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative"
      style={{
        width: "clamp(140px, 20vw, 260px)",
        aspectRatio: "2/3",
        backgroundColor: color,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        cursor: isEditing ? "default" : "pointer",
      }}
    >
      {/* Upload button — edit mode only */}
      {isEditing && (
        <label
          style={{
            position: "absolute", top: 8, left: 8, zIndex: 10, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
            background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(6px)",
            border: "1px solid oklch(1 0 0 / 0.25)", borderRadius: 6,
            padding: "3px 8px", fontSize: 11, color: "rgba(255,255,255,0.85)",
            fontFamily: "var(--font-mono, monospace)",
          }}
          title="Upload de imagem"
        >
          <Upload size={12} />
          Upload
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: "none" }}
          />
        </label>
      )}

      {/* Uploaded image */}
      {uploadedImage && (
        <img
          src={uploadedImage}
          alt={title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)",
        }}
      />

      {/* Footer text */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px", zIndex: 5 }}>
        {kicker && (
          <p style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "var(--font-sans, sans-serif)",
            margin: 0,
          }}>
            {kicker}
          </p>
        )}
        <InlineEdit
          as="p"
          value={title}
          contentKey={titleKey}
          onSave={onSave}
          isEditing={isEditing}
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: "clamp(0.95rem, 1.5vw, 1.4rem)",
            fontWeight: "500",
            color: "white",
            lineHeight: 1.2,
            margin: 0,
          }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminHomepagePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [content, setContent] = useState<Record<string, string>>({ ...SECTION_DEFAULTS })
  const [chars, setChars] = useState<Record<string, { name: string; role: string }>>({})
  const [charOrder, setCharOrder] = useState<string[]>([])
  const [cardImages, setCardImages] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([
      fetch("/api/site-content").then((r) => r.json()).catch(() => ({ content: [] })),
      fetch("/api/characters").then((r) => r.json()).catch(() => ({ chars: {}, order: [] })),
      fetch("/api/card-images").then((r) => r.json()).catch(() => ({ images: {} })),
    ]).then(([contentData, charData, cardData]) => {
      const map: Record<string, string> = { ...SECTION_DEFAULTS }
      for (const row of (contentData.content ?? [])) {
        if (row.key && row.value !== null) map[row.key] = row.value
      }
      setContent(map)
      if (charData.chars) {
        setChars(charData.chars)
        setCharOrder(charData.order ?? Object.keys(charData.chars))
      }
      setCardImages(cardData.images ?? {})
    })
  }, [])

  async function save(key: string, value: string) {
    setContent((prev) => ({ ...prev, [key]: value }))
    setSaving(true)
    try {
      await fetch("/api/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
      const now = new Date()
      setLastSaved(
        now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0")
      )
    } finally {
      setSaving(false)
    }
  }

  async function uploadCardImage(file: File, key: string) {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("key", key)
    const res = await fetch("/api/card-images", { method: "POST", body: fd })
    const data = await res.json()
    if (data.url) setCardImages((prev) => ({ ...prev, [key]: data.url }))
  }

  function getContent(key: string): string {
    return content[key] ?? SECTION_DEFAULTS[key] ?? ""
  }

  // ── Section header helper ──────────────────────────────────────────────────
  function SectionHeader({
    labelKey, titleKey, descKey, hasBanner = false,
  }: { labelKey: string; titleKey: string; descKey: string; hasBanner?: boolean }) {
    return (
      <div style={{ position: "relative", zIndex: 10, marginBottom: "2rem" }}>
        {/* Kicker / label */}
        <InlineEdit
          as="p"
          value={getContent(labelKey)}
          contentKey={labelKey}
          onSave={save}
          isEditing={isEditing}
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "var(--font-sans, sans-serif)",
            color: hasBanner ? "oklch(1 0 0 / 0.65)" : "var(--muted-foreground)",
            marginBottom: 10,
            display: "block",
          }}
        />
        {/* H2 title — LARGE, matching public page */}
        <InlineEdit
          as="h2"
          value={getContent(titleKey)}
          contentKey={titleKey}
          onSave={save}
          isEditing={isEditing}
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: "clamp(3rem, 6vw, 5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: hasBanner ? "white" : "var(--foreground)",
            marginBottom: 16,
            display: "block",
          }}
        />
        {/* Description paragraph */}
        <InlineEdit
          as="p"
          value={getContent(descKey)}
          contentKey={descKey}
          onSave={save}
          isEditing={isEditing}
          multiline
          style={{
            fontFamily: "var(--font-sans, sans-serif)",
            fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
            lineHeight: 1.6,
            maxWidth: "42rem",
            color: hasBanner ? "oklch(1 0 0 / 0.85)" : "var(--muted-foreground)",
            display: "block",
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)", minHeight: "100vh" }}>

      {/* ── Control bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 100, height: 44,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
          background: "oklch(0.06 0.008 280 / 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(1 0 0 / 0.08)",
        }}
      >
        {/* Left: brand + route */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "oklch(0.65 0.18 50)", display: "inline-block" }} />
          <span style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: 17, color: "white", lineHeight: 1 }}>
            Korú
          </span>
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "oklch(1 0 0 / 0.4)", letterSpacing: "0.06em" }}>
            admin · homepage
          </span>
        </div>

        {/* Centre: save status */}
        <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "oklch(1 0 0 / 0.5)", display: "flex", alignItems: "center", gap: 6 }}>
          {saving ? (
            <>
              <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
              Salvando...
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle2 size={12} style={{ color: "oklch(0.75 0.17 145)" }} />
              Salvo {lastSaved}
            </>
          ) : null}
        </div>

        {/* Right: view site + toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: "flex", alignItems: "center", gap: 4,
              fontFamily: "var(--font-mono, monospace)", fontSize: 11,
              color: "oklch(1 0 0 / 0.55)", textDecoration: "none",
              letterSpacing: "0.08em",
            }}
          >
            <ExternalLink size={12} />
            Ver site
          </Link>
          <button
            onClick={() => setIsEditing((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "var(--font-mono, monospace)", fontSize: 11,
              letterSpacing: "0.1em", textTransform: "uppercase",
              background: isEditing ? "oklch(0.65 0.18 50)" : "oklch(1 0 0 / 0.08)",
              color: isEditing ? "white" : "oklch(1 0 0 / 0.7)",
              border: "1px solid oklch(1 0 0 / 0.15)",
              borderRadius: 6, padding: "4px 12px", cursor: "pointer",
            }}
          >
            {isEditing ? <Eye size={12} /> : <Pencil size={12} />}
            {isEditing ? "Visualizar" : "Editar"}
          </button>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "var(--background)" }} />
        <div style={{ position: "relative", zIndex: 10, padding: "0 4rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "clamp(6rem, 18vw, 14rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.02em",
              marginBottom: "2rem",
              color: "var(--foreground)",
            }}
          >
            Korú
          </h1>
          <InlineEdit
            as="p"
            value={getContent("hero.tagline")}
            contentKey="hero.tagline"
            onSave={save}
            isEditing={isEditing}
            style={{
              fontFamily: "var(--font-sans, sans-serif)",
              fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
              lineHeight: 1.6,
              maxWidth: "42rem",
              color: "var(--muted-foreground)",
              display: "block",
            }}
          />
        </div>
      </section>

      {/* ── Bíblia ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          padding: "2.5rem 4rem 2rem",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "var(--background)" }} />
        <div style={{ position: "relative", zIndex: 10 }}>
          <SectionHeader
            labelKey="section.biblia.label"
            titleKey="section.biblia.title"
            descKey="section.biblia.description"
          />
          <CardCarousel>
            {BIBLIA_SLUGS.map((slug) => {
              const cardKey = `biblia-${slug}`
              const titleKey = `biblia.${slug}.title`
              const rawTitle = getContent(titleKey)
              const kicker = rawTitle.includes(" · ") ? rawTitle.split(" · ")[0] : undefined
              const displayTitle = rawTitle.includes(" · ") ? rawTitle.split(" · ")[1] : rawTitle
              return (
                <CardWithUpload
                  key={slug}
                  color={bibliaColor(slug)}
                  title={displayTitle}
                  titleKey={titleKey}
                  kicker={kicker}
                  isEditing={isEditing}
                  onSave={save}
                  cardKey={cardKey}
                  uploadedImage={cardImages[cardKey]}
                  onUpload={uploadCardImage}
                />
              )
            })}
          </CardCarousel>
        </div>
      </section>

      {/* ── Personagens ───────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          padding: "2.5rem 4rem 2rem",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "var(--background)" }} />
        <div style={{ position: "relative", zIndex: 10 }}>
          <SectionHeader
            labelKey="section.personagens.label"
            titleKey="section.personagens.title"
            descKey="section.personagens.description"
          />
          <CardCarousel>
            {charOrder.map((key) => {
              const char = chars[key]
              if (!char) return null
              const cardKey = `char-${key}`
              return (
                <CardWithUpload
                  key={key}
                  color={charColor(key)}
                  title={char.name}
                  titleKey={`char.${key}.name`}
                  kicker={char.role?.split(",")[0]?.trim()}
                  isEditing={isEditing}
                  onSave={save}
                  cardKey={cardKey}
                  uploadedImage={cardImages[cardKey]}
                  onUpload={uploadCardImage}
                />
              )
            })}
          </CardCarousel>
        </div>
      </section>

      {/* ── Contos ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          padding: "2.5rem 4rem 2rem",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "var(--background)" }} />
        <div style={{ position: "relative", zIndex: 10 }}>
          <SectionHeader
            labelKey="section.contos.label"
            titleKey="section.contos.title"
            descKey="section.contos.description"
          />
          <CardCarousel>
            {charOrder.map((key) => {
              const char = chars[key]
              if (!char) return null
              const cardKey = `conto-${key}`
              return (
                <CardWithUpload
                  key={key}
                  color={charColor(key)}
                  title={char.name}
                  titleKey={`conto.${key}.title`}
                  kicker="Conto"
                  isEditing={isEditing}
                  onSave={save}
                  cardKey={cardKey}
                  uploadedImage={cardImages[cardKey]}
                  onUpload={uploadCardImage}
                />
              )
            })}
          </CardCarousel>
        </div>
      </section>

      {/* ── Livro ─────────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          padding: "2.5rem 4rem 2rem",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "var(--background)" }} />
        <div style={{ position: "relative", zIndex: 10 }}>
          <SectionHeader
            labelKey="section.livro.label"
            titleKey="section.livro.title"
            descKey="section.livro.description"
          />
          <CardCarousel>
            {LIVRO_SLUGS.map((slug) => {
              const cardKey = `livro-${slug}`
              const titleKey = `livro.${slug}.title`
              const title = getContent(titleKey)
              const kicker = slug === "epilogo" ? "Fim" : `Cap. ${slug}`
              return (
                <CardWithUpload
                  key={slug}
                  color={livroColor(slug)}
                  title={title}
                  titleKey={titleKey}
                  kicker={kicker}
                  isEditing={isEditing}
                  onSave={save}
                  cardKey={cardKey}
                  uploadedImage={cardImages[cardKey]}
                  onUpload={uploadCardImage}
                />
              )
            })}
          </CardCarousel>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "var(--background)" }} />
        <p
          style={{
            position: "absolute", bottom: "1.5rem", left: 0, right: 0,
            textAlign: "center", zIndex: 10,
          }}
        >
          <InlineEdit
            as="span"
            value={getContent("footer.copyright")}
            contentKey="footer.copyright"
            onSave={save}
            isEditing={isEditing}
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "14px",
              letterSpacing: "0.08em",
              color: "var(--muted-foreground)",
            }}
          />
        </p>
      </section>

      {/* Keyframes for loader spin */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
