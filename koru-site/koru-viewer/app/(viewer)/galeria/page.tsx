"use client"

import { useEffect, useState, useCallback } from "react"

interface GalleryImage {
  name: string
  url: string
  created_at: string
}

export default function GaleriaPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => {
        setImages(data.images ?? [])
        setLoading(false)
      })
  }, [])

  const openLightbox = useCallback(
    (img: GalleryImage, index: number) => {
      setSelected(img)
      setSelectedIndex(index)
    },
    []
  )

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
    <div className="h-[100dvh] overflow-y-auto" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 md:px-10 py-4" style={{ background: "var(--background)" }}>
        <div className="flex items-end gap-4">
          <h1
            className="font-serif text-3xl md:text-4xl leading-none"
            style={{ color: "var(--foreground)" }}
          >
            Galeria
          </h1>
          <p className="font-sans text-sm pb-0.5" style={{ color: "var(--muted-foreground)" }}>
            Cenas do Akwu
          </p>
          <div className="ml-auto font-sans text-xs tabular-nums" style={{ color: "var(--muted-foreground)" }}>
            {!loading && `${images.length} ${images.length === 1 ? "imagem" : "imagens"}`}
          </div>
        </div>
        <div className="mt-3 h-px" style={{ background: "var(--border)" }} />
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
            />
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              style={{ color: "var(--muted-foreground)", opacity: 0.3 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
              Nenhuma cena na galeria ainda.
            </p>
          </div>
        ) : (
          <div
            style={{
              columns: "400px",
              columnGap: "8px",
            }}
          >
            {images.map((img, i) => (
              <div
                key={img.name}
                className="group relative mb-2 break-inside-avoid cursor-pointer overflow-hidden rounded-xl"
                onClick={() => openLightbox(img, i)}
                style={{ breakInside: "avoid" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.name.replace(/\.[^.]+$/, "").replace(/-/g, " ")}
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
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-1 group-hover:translate-y-0">
                  <p className="font-sans text-sm text-white truncate">
                    {img.name.replace(/\.[^.]+$/, "").replace(/-/g, " ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative max-w-[92vw] max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
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
                onClick={closeLightbox}
                className="ml-4 font-sans text-sm transition-colors"
                style={{ color: "oklch(1 0 0 / 0.5)" }}
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
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
