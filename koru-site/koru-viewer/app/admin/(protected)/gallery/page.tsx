"use client"

import { useEffect, useState, useRef, useCallback } from "react"

interface GalleryImage {
  name: string
  url: string
  created_at: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [imageName, setImageName] = useState("")
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  function fetchImages() {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => {
        setImages(data.images ?? [])
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchImages()
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      if (imageName.trim()) formData.append("name", imageName.trim())

      const res = await fetch("/api/gallery", { method: "POST", body: formData })
      const data = await res.json()

      if (data.error) {
        alert("Erro no upload: " + data.error)
      } else {
        setImageName("")
        fetchImages()
      }
    } catch (err) {
      alert("Erro de rede no upload: " + (err instanceof Error ? err.message : String(err)))
      console.error("Upload error:", err)
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleDelete(name: string) {
    if (!confirm("Remover esta imagem?")) return
    await fetch("/api/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setSelected(null)
    setSelectedIndex(-1)
    fetchImages()
  }

  const openLightbox = useCallback((img: GalleryImage, index: number) => {
    setSelected(img)
    setSelectedIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setSelected(null)
    setSelectedIndex(-1)
  }, [])

  const goNext = useCallback(() => {
    if (images.length === 0) return
    const next = (selectedIndex + 1) % images.length
    setSelected(images[next])
    setSelectedIndex(next)
  }, [images, selectedIndex])

  const goPrev = useCallback(() => {
    if (images.length === 0) return
    const prev = (selectedIndex - 1 + images.length) % images.length
    setSelected(images[prev])
    setSelectedIndex(prev)
  }, [images, selectedIndex])

  useEffect(() => {
    if (!selected) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [selected, closeLightbox, goNext, goPrev])

  return (
    <div className="w-full">
      {/* Header + upload */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
              Galeria
            </h1>
            <p className="mt-1 font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
              Cenas e artes do mundo de Koru
            </p>
          </div>
          <span className="font-sans text-xs tabular-nums" style={{ color: "var(--muted-foreground)" }}>
            {!loading && `${images.length} ${images.length === 1 ? "imagem" : "imagens"}`}
          </span>
        </div>

        <div
          className="rounded-xl p-4 flex items-end gap-3 glass-card"
        >
          <div className="flex-1">
            <label
              className="font-sans text-xs tracking-[0.12em] uppercase block mb-1.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              Nome da cena (opcional)
            </label>
            <input
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              placeholder="Ex: floresta-akwu, templo-noturno..."
              className="w-full rounded-lg px-3 py-2 font-sans text-sm outline-none"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="absolute w-0 h-0 opacity-0 overflow-hidden"
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-sm transition-opacity disabled:opacity-50"
            style={{
              background: "var(--foreground)",
              color: "var(--background)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {uploading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>

      {/* Masonry gallery */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--foreground)" }}
          />
        </div>
      ) : images.length === 0 ? (
        <div
          className="rounded-xl py-16 text-center"
          style={{ border: "1px solid var(--border)" }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="mx-auto mb-4" style={{ color: "var(--muted-foreground)", opacity: 0.3 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
            Nenhuma cena na galeria ainda.
          </p>
        </div>
      ) : (
        <div style={{ columns: "400px", columnGap: "8px" }}>
          {images.map((img, i) => (
            <div
              key={img.name}
              className="group relative mb-2 break-inside-avoid cursor-pointer overflow-hidden rounded-xl"
              style={{ breakInside: "avoid" }}
              onClick={() => openLightbox(img, i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.name.replace(/\.[^.]+$/, "")}
                className="w-full block transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, oklch(0 0 0 / 0) 50%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="font-sans text-xs text-white truncate flex-1 mr-2">
                  {img.name.replace(/\.[^.]+$/, "").replace(/-/g, " ")}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(img.name)
                  }}
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "oklch(0 0 0 / 0.4)" }}
                  title="Excluir"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "oklch(0 0 0 / 0.92)" }}
          onClick={closeLightbox}
        >
          {/* Nav arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>

          {/* Image */}
          <div className="relative max-w-[92vw] max-h-[92vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.url}
              alt={selected.name}
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
            />
            <div className="mt-3 flex items-center gap-4">
              <p className="font-sans text-sm" style={{ color: "oklch(1 0 0 / 0.7)" }}>
                {selected.name.replace(/\.[^.]+$/, "").replace(/-/g, " ")}
              </p>
              <span className="font-sans text-xs tabular-nums" style={{ color: "oklch(1 0 0 / 0.35)" }}>
                {selectedIndex + 1} / {images.length}
              </span>
              <button
                onClick={() => handleDelete(selected.name)}
                className="font-sans text-xs transition-colors"
                style={{ color: "var(--muted-foreground)" }}
              >
                Excluir
              </button>
              <button
                onClick={closeLightbox}
                className="ml-2 font-sans text-sm transition-colors"
                style={{ color: "oklch(1 0 0 / 0.5)" }}
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Close X */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
