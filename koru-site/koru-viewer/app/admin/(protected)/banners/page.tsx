"use client"

import { useEffect, useState, useRef } from "react"
import { ImagePositioner } from "@/components/admin/image-positioner"
import { BIBLIA_ITEMS } from "@/lib/navigation"

const SLOT_COLORS: Record<string, string> = {
  hero: "var(--gold)",
  "hero-video": "var(--gold)",
  personagens: "var(--accent)",
  "personagens-video": "var(--accent)",
  biblia: "var(--gold)",
  "biblia-video": "var(--gold)",
  livro: "var(--blue-cold)",
  "livro-video": "var(--blue-cold)",
  contos: "var(--accent)",
  "contos-video": "var(--accent)",
  footer: "var(--muted-foreground)",
  "footer-video": "var(--muted-foreground)",
}

const IMAGE_SLOTS = [
  { key: "hero", label: "Hero", description: "Imagem de fundo da tela inicial", accept: "image/*", dims: "1920×1080 recomendado" },
  { key: "personagens", label: "Personagens", description: "Os seres do Akwu", accept: "image/*", dims: "1920×1080 recomendado" },
  { key: "biblia", label: "Biblia", description: "O arquivo vivo", accept: "image/*", dims: "1920×1080 recomendado" },
  { key: "livro", label: "Livro", description: "A historia de Temiku", accept: "image/*", dims: "1920×1080 recomendado" },
  { key: "contos", label: "Contos", description: "Vozes do Akwu", accept: "image/*", dims: "1920×1080 recomendado" },
  { key: "footer", label: "Footer", description: "Banner final da home", accept: "image/*", dims: "1920×600 recomendado" },
]

const VIDEO_SLOTS = [
  { key: "hero-video", label: "Hero", description: "Video de fundo da tela inicial", accept: "video/*", dims: "1920×1080 · MP4 ou WebM" },
  { key: "personagens-video", label: "Personagens", description: "Video de fundo da secao Personagens", accept: "video/*", dims: "1920×1080 · MP4 ou WebM" },
  { key: "biblia-video", label: "Biblia", description: "Video de fundo da secao Biblia", accept: "video/*", dims: "1920×1080 · MP4 ou WebM" },
  { key: "livro-video", label: "Livro", description: "Video de fundo da secao Livro", accept: "video/*", dims: "1920×1080 · MP4 ou WebM" },
  { key: "contos-video", label: "Contos", description: "Video de fundo da secao Contos", accept: "video/*", dims: "1920×1080 · MP4 ou WebM" },
  { key: "footer-video", label: "Footer", description: "Video de fundo do banner final", accept: "video/*", dims: "1920×600 · MP4 ou WebM" },
]

// Banners for internal Bíblia pages — each doc has its own hero banner
const BIBLIA_DOC_IMAGE_SLOTS = BIBLIA_ITEMS.map((item) => ({
  key: `doc-${item.slug}`,
  label: item.title,
  description: `Hero da página · ${item.title}`,
  accept: "image/*",
  dims: "2000×500 recomendado",
}))

const BIBLIA_DOC_VIDEO_SLOTS = BIBLIA_ITEMS.map((item) => ({
  key: `doc-${item.slug}-video`,
  label: item.title,
  description: `Vídeo hero · ${item.title}`,
  accept: "video/*",
  dims: "2000×500 · MP4 ou WebM",
}))

export default function BannersPage() {
  const [banners, setBanners] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((d) => setBanners(d.banners || {}))
  }, [])

  async function handleUpload(slot: string, file: File) {
    setUploading(slot)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("slot", slot)

      const res = await fetch("/api/banners", { method: "POST", body: formData })
      const data = await res.json()

      if (res.ok) {
        setBanners((prev) => ({ ...prev, [slot]: data.url + "?t=" + Date.now() }))
        setMessage(`Banner "${slot}" atualizado`)
      } else {
        setMessage(`Erro: ${data.error}`)
      }
    } catch (err) {
      setMessage(`Erro de rede: ${err instanceof Error ? err.message : String(err)}`)
      console.error("Upload error:", err)
    }

    setUploading(null)
    setTimeout(() => setMessage(null), 5000)
  }

  async function handleDelete(slot: string) {
    setUploading(slot)
    const res = await fetch("/api/banners", {
      method: "DELETE",
      body: JSON.stringify({ slot }),
      headers: { "Content-Type": "application/json" },
    })

    if (res.ok) {
      setBanners((prev) => {
        const next = { ...prev }
        delete next[slot]
        return next
      })
      setMessage(`Banner "${slot}" removido`)
    }

    setUploading(null)
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
          Galeria de Cenas
        </h1>
        <p className="mt-1 font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
          Banners do mundo de Koru — cada secao da home recebe imagem e video
        </p>
      </div>

      {message && (
        <div
          className="mb-6 rounded-xl px-4 py-3 font-sans text-sm glass-card"
          style={{ color: "var(--foreground)" }}
        >
          {message}
        </div>
      )}

      {/* Image banners section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted-foreground)" }}>
            Imagens
          </p>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span
            className="rounded-full px-2.5 py-0.5 font-sans text-[10px]"
            style={{
              color: "var(--gold)",
              background: "color-mix(in oklch, var(--gold) 12%, transparent)",
            }}
          >
            {IMAGE_SLOTS.filter((s) => banners[s.key]).length}/{IMAGE_SLOTS.length} configurados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {IMAGE_SLOTS.map((slot) => (
            <BannerSlot
              key={slot.key}
              slot={slot}
              imageUrl={banners[slot.key]}
              uploading={uploading === slot.key}
              onUpload={(file) => handleUpload(slot.key, file)}
              onDelete={() => handleDelete(slot.key)}
              accentColor={SLOT_COLORS[slot.key]}
            />
          ))}
        </div>
      </div>

      {/* Video banners section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted-foreground)" }}>
            Videos
          </p>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span
            className="rounded-full px-2.5 py-0.5 font-sans text-[10px]"
            style={{
              color: "var(--blue-cold)",
              background: "color-mix(in oklch, var(--blue-cold) 12%, transparent)",
            }}
          >
            {VIDEO_SLOTS.filter((s) => banners[s.key]).length}/{VIDEO_SLOTS.length} configurados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {VIDEO_SLOTS.map((slot) => (
            <BannerSlot
              key={slot.key}
              slot={slot}
              imageUrl={banners[slot.key]}
              uploading={uploading === slot.key}
              onUpload={(file) => handleUpload(slot.key, file)}
              onDelete={() => handleDelete(slot.key)}
              accentColor={SLOT_COLORS[slot.key]}
            />
          ))}
        </div>
      </div>

      {/* Bíblia page banners — hero of each internal page */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted-foreground)" }}>
            Bíblia · Páginas Internas (Imagens)
          </p>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span
            className="rounded-full px-2.5 py-0.5 font-sans text-[10px]"
            style={{
              color: "var(--gold)",
              background: "color-mix(in oklch, var(--gold) 12%, transparent)",
            }}
          >
            {BIBLIA_DOC_IMAGE_SLOTS.filter((s) => banners[s.key]).length}/{BIBLIA_DOC_IMAGE_SLOTS.length} configurados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {BIBLIA_DOC_IMAGE_SLOTS.map((slot) => (
            <BannerSlot
              key={slot.key}
              slot={slot}
              imageUrl={banners[slot.key]}
              uploading={uploading === slot.key}
              onUpload={(file) => handleUpload(slot.key, file)}
              onDelete={() => handleDelete(slot.key)}
              accentColor="var(--gold)"
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted-foreground)" }}>
            Bíblia · Páginas Internas (Vídeos)
          </p>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span
            className="rounded-full px-2.5 py-0.5 font-sans text-[10px]"
            style={{
              color: "var(--blue-cold)",
              background: "color-mix(in oklch, var(--blue-cold) 12%, transparent)",
            }}
          >
            {BIBLIA_DOC_VIDEO_SLOTS.filter((s) => banners[s.key]).length}/{BIBLIA_DOC_VIDEO_SLOTS.length} configurados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {BIBLIA_DOC_VIDEO_SLOTS.map((slot) => (
            <BannerSlot
              key={slot.key}
              slot={slot}
              imageUrl={banners[slot.key]}
              uploading={uploading === slot.key}
              onUpload={(file) => handleUpload(slot.key, file)}
              onDelete={() => handleDelete(slot.key)}
              accentColor="var(--blue-cold)"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function BannerSlot({
  slot,
  imageUrl,
  uploading,
  onUpload,
  onDelete,
  accentColor,
}: {
  slot: { key: string; label: string; description: string; accept: string; dims: string }
  imageUrl?: string
  uploading: boolean
  onUpload: (file: File) => void
  onDelete: () => void
  accentColor: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isVideo = slot.accept === "video/*"

  return (
    <div className="rounded-xl overflow-hidden glass-card">
      {/* Media area */}
      <div className="relative" style={{ backgroundColor: "var(--background)" }}>
        {imageUrl && (isVideo || /\.(mp4|webm|mov)(\?|$)/i.test(imageUrl)) ? (
          <div style={{ aspectRatio: "16/9" }}>
            <video
              src={imageUrl}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay muted loop playsInline
            />
          </div>
        ) : imageUrl ? (
          <ImagePositioner
            imageKey={`banner-${slot.key}`}
            src={imageUrl}
            alt={slot.label}
            aspectRatio="16/9"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-colors"
            style={{ aspectRatio: "16/9", background: "var(--surface)" }}
            onClick={() => inputRef.current?.click()}
            title="Clique para fazer upload"
          >
            {isVideo ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="opacity-20" style={{ color: "var(--muted-foreground)" }}>
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="opacity-20" style={{ color: "var(--muted-foreground)" }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            )}
            <div className="text-center">
              <p className="font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
                Sem {isVideo ? "video" : "imagem"}
              </p>
              <p className="font-sans text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
                {slot.dims}
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "oklch(0 0 0 / 0.55)" }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
              <p className="font-sans text-xs text-white">Enviando...</p>
            </div>
          </div>
        )}
      </div>

      {/* Info + actions */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-sans text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {slot.label}
              </p>
              <span
                className="rounded-full px-2 py-0.5 font-sans text-[9px] uppercase tracking-[0.12em] shrink-0"
                style={{
                  color: accentColor,
                  background: `color-mix(in oklch, ${accentColor} 14%, transparent)`,
                }}
              >
                {isVideo ? "video" : "imagem"}
              </span>
            </div>
            <p className="font-sans text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
              {slot.description}
            </p>
            {!imageUrl && (
              <p className="font-sans text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)", opacity: 0.55 }}>
                {slot.dims}
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="file"
              accept={slot.accept}
              className="absolute w-0 h-0 opacity-0 overflow-hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onUpload(file)
                e.target.value = ""
              }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-full font-sans text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
              }}
            >
              {imageUrl ? "Trocar" : "Upload"}
            </button>
            {imageUrl && (
              <button
                onClick={onDelete}
                disabled={uploading}
                className="px-4 py-2 rounded-full font-sans text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                Remover
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
