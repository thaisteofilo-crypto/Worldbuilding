"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Upload, Eye, Pencil, ExternalLink, CheckCircle2, Loader2 } from "lucide-react"
import { CardCarousel } from "@/components/koru/card-carousel"

// ---------------------------------------------------------------------------
// Color maps
// ---------------------------------------------------------------------------

const BIBLIA_COLORS: Record<string, string> = {
  "manifesto": "#E99000", "parte-00-manifesto": "#E99000", "parte-00": "#9B6C22",
  "parte-01": "#707C36", "parte-02": "#8B3D17", "parte-03": "#707C36",
  "parte-04": "#C72211", "parte-05": "#BF505C", "parte-06": "#9B6C22",
  "parte-07": "#E99000", "parte-08": "#8B3D17",
  "glossario-de-koru": "#DD560D", "glossario-de-lugares": "#707C36",
}
function bibliaColor(slug: string): string {
  const key = slug.replace(/^parte-(\d+).*/, "parte-$1")
  return BIBLIA_COLORS[slug] ?? BIBLIA_COLORS[key] ?? "#9B6C22"
}

const CHAR_COLORS: Record<string, string> = {
  temiku: "#BF505C", amara: "#707C36", oruku: "#9B6C22", beku: "#8B3D17",
  obaru: "#C72211", kemdi: "#DD560D", temi: "#E99000", orike: "#707C36", kairo: "#BF505C",
}
function charColor(slug: string): string {
  return CHAR_COLORS[slug] ?? "#9B6C22"
}

const LIVRO_COLORS: Record<string, string> = {
  "01": "#C72211", "02": "#DD560D", "03": "#BF505C", "04": "#707C36",
  "05": "#9B6C22", "06": "#8B3D17", "07": "#E99000", "08": "#C72211",
  "09": "#DD560D", "10": "#BF505C", "11": "#707C36", "12": "#9B6C22", epilogo: "#E99000",
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

const BIBLIA_DEFAULTS: Record<string, string> = {
  "parte-00-manifesto": "Introdução · A Língua de Korú",
  "parte-01-fisica-cosmologia": "Física · A Natureza do Akwu",
  "parte-02-geografia": "Geografia · Ikwe e seus Lugares",
  "parte-03-ecossistema": "Ecossistema · O Ciclo da Memória",
  "parte-04-criaturas": "Criaturas · Os Seres de Korú",
  "parte-05-personagens": "Personagens · Quem Habita",
  "parte-06-regras": "Regras · Os 13 Acordos",
  "parte-07-cultura": "Cultura · Como se Vive",
  "parte-08-linha-do-tempo": "Linha do Tempo · As Seis Eras",
  "glossario-de-koru": "Glossário de Korú",
  "glossario-de-lugares": "Glossário de Lugares",
}

const LIVRO_DEFAULTS: Record<string, string> = {
  "01": "O que ela é", "02": "Manhãs", "03": "A cidade",
  "04": "A mentira silenciosa", "05": "Entre o lilás e o cinza",
  "06": "O que a floresta guarda", "07": "O projeto do fim do luto",
  "08": "A chuva", "09": "O limiar como morada", "10": "A noite antes",
  "11": "O que ela paga", "12": "O retorno", "epilogo": "Epílogo",
}

const SECTION_DEFAULTS: Record<string, string> = {
  "hero.tagline": "Um mundo cuja física é baseada em memória.",
  "section.biblia.label": "Bíblia do Mundo",
  "section.biblia.title": "O arquivo vivo",
  "section.biblia.description": "A física, a cosmologia, as criaturas e os acordos que sustentam o Akwu.",
  "section.personagens.label": "Personagens",
  "section.personagens.title": "Os seres do Akwu",
  "section.personagens.description": "Cada ser carrega memória em substâncias diferentes.",
  "section.contos.label": "Contos",
  "section.contos.title": "Vozes do Akwu",
  "section.contos.description": "Sete histórias. Sete formas de habitar o mesmo mundo.",
  "section.livro.label": "Livro",
  "section.livro.title": "O Peso da Luz",
  "section.livro.description": "A história de Temiku, em doze capítulos.",
  "footer.copyright": "© Thaís Teófilo · Todos os direitos reservados",
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
  as: Tag = "p",
  value,
  contentKey,
  onSave,
  isEditing,
  multiline = false,
  className,
  style,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing && ref.current) ref.current.focus()
  }, [editing])

  if (!isEditing) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    )
  }

  if (!editing) {
    return (
      <Tag
        className={className}
        style={{ ...style, cursor: "text", outline: "1px dashed oklch(1 0 0 / 0.25)", borderRadius: 3 }}
        onClick={() => setEditing(true)}
        title="Clique para editar"
      >
        {value || <span style={{ opacity: 0.4 }}>clique para editar</span>}
      </Tag>
    )
  }

  function commit() {
    setEditing(false)
    if (draft !== value) onSave(contentKey, draft)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setDraft(value); setEditing(false) }
    if (e.key === "Enter" && !multiline) { e.preventDefault(); commit() }
  }

  const inputStyle: React.CSSProperties = {
    ...style,
    background: "oklch(0.12 0.008 280 / 0.85)",
    border: "1px solid oklch(1 0 0 / 0.3)",
    borderRadius: 4,
    padding: "2px 6px",
    outline: "none",
    width: "100%",
    color: "inherit",
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    resize: multiline ? "vertical" : "none",
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={className}
        style={inputStyle}
        rows={3}
      />
    )
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      className={className}
      style={inputStyle}
    />
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
    // reset so same file can be re-uploaded
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
      }}
    >
      {/* Upload button (edit mode only) */}
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
            className="hidden"
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
          background: "linear-gradient(to top, oklch(0 0 0 / 0.65) 0%, transparent 55%)",
        }}
      />

      {/* Footer text */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px", zIndex: 5 }}>
        {kicker && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans, sans-serif)", margin: 0 }}>
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
            fontSize: "clamp(0.95rem, 1.8vw, 1.4rem)",
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
  const [content, setContent] = useState<Record<string, string>>(SECTION_DEFAULTS)
  const [chars, setChars] = useState<Record<string, { name: string; role: string }>>({})
  const [charOrder, setCharOrder] = useState<string[]>([])
  const [cardImages, setCardImages] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([
      fetch("/api/site-content").then((r) => r.json()).catch(() => ({ content: [] })),
      fetch("/api/characters").then((r) => r.json()).catch(() => ({ chars: {}, order: [] })),
      fetch("/api/card-images").then((r) => r.json()).catch(() => ({ images: {} })),
    ]).then(([contentData, charData, cardData]) => {
      const map = { ...SECTION_DEFAULTS }
      for (const row of (contentData.content ?? [])) {
        if (row.key) map[row.key] = row.value
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
    await fetch("/api/site-content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    })
    setSaving(false)
    setLastSaved(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }))
  }

  async function uploadCardImage(file: File, key: string) {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("key", key)
    const res = await fetch("/api/card-images", { method: "POST", body: fd })
    const data = await res.json()
    if (data.url) setCardImages((prev) => ({ ...prev, [key]: data.url }))
  }

  function get(key: string): string {
    return content[key] ?? SECTION_DEFAULTS[key] ?? ""
  }

  // ── Control bar ─────────────────────────────────────────────────────────────
  const ControlBar = (
    <div
      style={{
        position: "sticky", top: 0, zIndex: 100, height: 44,
        background: "oklch(0.06 0.008 280 / 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid oklch(1 0 0 / 0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingInline: "1rem",
        flexShrink: 0,
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: 17, color: "white", lineHeight: 1 }}>
          Korú
        </span>
        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "oklch(1 0 0 / 0.4)", letterSpacing: "0.06em" }}>
          admin · homepage
        </span>
      </div>

      {/* Centre */}
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

      {/* Right */}
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
  )

  // ── Section header helper ────────────────────────────────────────────────────
  function SectionHeader({
    labelKey, titleKey, descKey,
  }: { labelKey: string; titleKey: string; descKey: string }) {
    return (
      <div style={{ position: "relative", zIndex: 10, marginBottom: "2rem" }}>
        <InlineEdit
          as="p"
          value={get(labelKey)}
          contentKey={labelKey}
          onSave={save}
          isEditing={isEditing}
          style={{
            fontFamily: "var(--font-mono, monospace)", fontSize: 11,
            textTransform: "uppercase", letterSpacing: "0.18em",
            color: "var(--muted-foreground)", marginBottom: 8,
          }}
        />
        <InlineEdit
          as="h2"
          value={get(titleKey)}
          contentKey={titleKey}
          onSave={save}
          isEditing={isEditing}
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: "clamp(2.5rem, 7vw, 5rem)",
            lineHeight: 1.05, letterSpacing: "-0.02em",
            color: "var(--foreground)", marginBottom: 12, display: "block",
          }}
        />
        <InlineEdit
          as="p"
          value={get(descKey)}
          contentKey={descKey}
          onSave={save}
          isEditing={isEditing}
          multiline
          style={{
            fontFamily: "var(--font-sans, sans-serif)",
            fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
            lineHeight: 1.6, maxWidth: "40rem",
            color: "var(--muted-foreground)",
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        overflowY: "auto", background: "var(--background)",
      }}
    >
      {/* ── Control bar ─────────────────────────────────────────────── */}
      {ControlBar}

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", minHeight: "100vh",
          display: "flex", flexDirection: "column", justifyContent: "center",
          overflow: "hidden", padding: "2.5rem 4rem",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "var(--background)" }} />
        <div style={{ position: "relative", zIndex: 10 }}>
          <h1
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "clamp(6rem, 18vw, 14rem)",
              lineHeight: 0.85, marginBottom: "2rem",
              color: "var(--foreground)",
            }}
          >
            Korú
          </h1>
          <InlineEdit
            as="p"
            value={get("hero.tagline")}
            contentKey="hero.tagline"
            onSave={save}
            isEditing={isEditing}
            style={{
              fontFamily: "var(--font-sans, sans-serif)",
              fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
              lineHeight: 1.5, maxWidth: "36rem",
              color: "var(--muted-foreground)",
            }}
          />
        </div>
      </section>

      {/* ── Bíblia ──────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh", padding: "2.5rem 4rem",
          display: "flex", flexDirection: "column", justifyContent: "center",
          position: "relative",
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
              const rawTitle = get(titleKey) || BIBLIA_DEFAULTS[slug] || slug
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

      {/* ── Personagens ─────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh", padding: "2.5rem 4rem",
          display: "flex", flexDirection: "column", justifyContent: "center",
          position: "relative",
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

      {/* ── Contos ──────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh", padding: "2.5rem 4rem",
          display: "flex", flexDirection: "column", justifyContent: "center",
          position: "relative",
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

      {/* ── Livro ───────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh", padding: "2.5rem 4rem",
          display: "flex", flexDirection: "column", justifyContent: "center",
          position: "relative",
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
              const title = get(titleKey) || LIVRO_DEFAULTS[slug] || `Capítulo ${slug}`
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

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh", position: "relative",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "var(--background)" }} />
        <div
          style={{
            position: "relative", zIndex: 10,
            padding: "1.5rem", textAlign: "center",
          }}
        >
          <InlineEdit
            as="p"
            value={get("footer.copyright")}
            contentKey="footer.copyright"
            onSave={save}
            isEditing={isEditing}
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "0.9rem", letterSpacing: "0.08em",
              color: "oklch(1 0 0 / 0.25)",
            }}
          />
        </div>
      </section>

      {/* Keyframes for loader spin */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
