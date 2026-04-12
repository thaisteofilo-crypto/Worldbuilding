"use client"

import { useEffect, useState, useRef } from "react"
import { ImagePositioner } from "@/components/admin/image-positioner"

const BANNER_SLOTS = [
  { key: "hero", label: "Hero (Imagem)", description: "Imagem de fundo da tela inicial", accept: "image/*" },
  { key: "hero-video", label: "Hero (Video)", description: "Video de fundo da tela inicial (mp4)", accept: "video/*" },
  { key: "personagens", label: "Personagens", description: "Os seres do Akwu", accept: "image/*,video/*" },
  { key: "biblia", label: "Bíblia", description: "O arquivo vivo", accept: "image/*,video/*" },
  { key: "livro", label: "Livro", description: "A história de Temiku", accept: "image/*,video/*" },
  { key: "contos", label: "Contos", description: "Vozes do Akwu", accept: "image/*,video/*" },
  { key: "referencias", label: "Referências", description: "Mundos que alimentam Korú", accept: "image/*,video/*" },
]

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
      <div className="mb-8">
        <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
          Galeria de Cenas
        </h1>
        <p className="mt-1 font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
          Banners do mundo de Korú — cada seção da home recebe uma imagem
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BANNER_SLOTS.map((slot) => (
          <BannerSlot
            key={slot.key}
            slot={slot}
            imageUrl={banners[slot.key]}
            uploading={uploading === slot.key}
            onUpload={(file) => handleUpload(slot.key, file)}
            onDelete={() => handleDelete(slot.key)}
          />
        ))}
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
}: {
  slot: { key: string; label: string; description: string; accept: string }
  imageUrl?: string
  uploading: boolean
  onUpload: (file: File) => void
  onDelete: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className="rounded-xl overflow-hidden glass-card"
    >
      {/* Image area */}
      <div
        className="relative"
        style={{ backgroundColor: "var(--background)" }}
      >
        {imageUrl && (slot.key === "hero-video" || /\.(mp4|webm|mov)(\?|$)/i.test(imageUrl)) ? (
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
          <div className="flex flex-col items-center justify-center gap-2" style={{ aspectRatio: "16/9" }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className="opacity-20"
              style={{ color: "var(--muted-foreground)" }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            <p
              className="text-xs font-sans"
              style={{ color: "var(--muted-foreground)" }}
            >
              Sem imagem
            </p>
          </div>
        )}

        {uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "oklch(0 0 0 / 0.5)" }}
          >
            <p className="text-sm font-sans text-white">Enviando...</p>
          </div>
        )}
      </div>

      {/* Info + actions */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <p
            className="font-sans text-sm font-medium"
            style={{ color: "var(--foreground)" }}
          >
            {slot.label}
          </p>
          <p
            className="font-sans text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            {slot.description}
          </p>
        </div>
        <div className="flex gap-2">
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
            className="px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
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
              className="px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
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
  )
}
