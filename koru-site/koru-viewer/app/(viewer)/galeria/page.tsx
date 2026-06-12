"use client"

import { useEffect, useState, useCallback, useRef } from "react"

interface GalleryImage {
  name: string
  url: string
  created_at: string
}

export default function GaleriaPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [filtered, setFiltered] = useState<GalleryImage[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Zoom / pan do lightbox
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const resetZoom = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setIsDragging(false)
    dragStart.current = null
  }, [])

  const zoomIn = useCallback(() => {
    setZoom(2)
  }, [])

  const zoomOut = useCallback(() => {
    resetZoom()
  }, [resetZoom])

  const toggleZoom = useCallback(() => {
    if (zoom === 1) {
      setZoom(2)
    } else {
      resetZoom()
    }
  }, [zoom, resetZoom])

  const displayImages = activeTag !== null ? filtered : images

  const loadImages = useCallback(() => {
    setLoading(true)
    setError(false)
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((galleryData) => {
        setImages(galleryData.images ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadImages()
  }, [loadImages])

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
    if (displayImages.length === 0) return
    const next = (selectedIndex + 1) % displayImages.length
    setSelected(displayImages[next])
    setSelectedIndex(next)
    resetZoom()
  }, [displayImages, selectedIndex, resetZoom])

  const goPrev = useCallback(() => {
    if (displayImages.length === 0) return
    const prev = (selectedIndex - 1 + displayImages.length) % displayImages.length
    setSelected(displayImages[prev])
    setSelectedIndex(prev)
    resetZoom()
  }, [displayImages, selectedIndex, resetZoom])

  // Trocar de imagem (ou abrir/fechar) sempre reseta o zoom
  useEffect(() => {
    resetZoom()
  }, [selectedIndex, resetZoom])

  useEffect(() => {
    if (!selected) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "0") resetZoom()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [selected, closeLightbox, goNext, goPrev, resetZoom])

  return (
    <div className="h-[calc(100dvh-2.5rem)] overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background px-4 sm:px-6 md:px-10 py-4">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
          <h1 className="font-serif text-3xl md:text-4xl leading-none text-foreground">
            Galeria
          </h1>
          <p className="font-sans text-sm pb-0.5 text-muted-foreground">
            Cenas do Akwu
          </p>
          <div className="ml-auto font-sans text-xs tabular-nums text-muted-foreground">
            {!loading && !error && `${displayImages.length} ${displayImages.length === 1 ? "imagem" : "imagens"}`}
          </div>
        </div>
        <div className="mt-3 h-px bg-border" />
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-6 h-6 rounded-full border-2 border-border border-t-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <p className="font-serif text-xl text-foreground">
              Nao foi possivel carregar as cenas.
            </p>
            <button
              onClick={loadImages}
              className="font-sans text-sm rounded-full px-5 py-2 transition-colors bg-muted text-muted-foreground border border-border hover:text-foreground"
            >
              Tentar novamente
            </button>
          </div>
        ) : displayImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              className="text-muted-foreground opacity-30"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="font-sans text-sm text-muted-foreground">
              Nenhuma cena na galeria ainda.
            </p>
          </div>
        ) : (
          <div
            style={{
              columns: "320px",
              columnGap: "8px",
            }}
          >
            {displayImages.map((img, i) => (
              <div
                key={img.name}
                role="button"
                tabIndex={0}
                className="group relative mb-2 break-inside-avoid cursor-pointer overflow-hidden rounded-xl"
                onClick={() => openLightbox(img, i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    openLightbox(img, i)
                  }
                }}
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
          role="dialog"
          aria-modal="true"
          aria-label="Visualizador de imagem"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "oklch(0 0 0 / 0.92)" }}
          onClick={closeLightbox}
        >
          {/* Nav arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            aria-label="Imagem anterior"
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            aria-label="Próxima imagem"
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
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
            <div className="overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.url}
                alt={selected.name}
                draggable={false}
                onDoubleClick={toggleZoom}
                onPointerDown={(e) => {
                  if (zoom === 1) return
                  e.preventDefault()
                  e.currentTarget.setPointerCapture(e.pointerId)
                  dragStart.current = {
                    x: e.clientX,
                    y: e.clientY,
                    ox: offset.x,
                    oy: offset.y,
                  }
                  setIsDragging(true)
                }}
                onPointerMove={(e) => {
                  if (!dragStart.current) return
                  setOffset({
                    x: dragStart.current.ox + (e.clientX - dragStart.current.x),
                    y: dragStart.current.oy + (e.clientY - dragStart.current.y),
                  })
                }}
                onPointerUp={() => {
                  dragStart.current = null
                  setIsDragging(false)
                }}
                onPointerCancel={() => {
                  dragStart.current = null
                  setIsDragging(false)
                }}
                className="max-w-full max-h-[85vh] rounded-lg object-contain select-none"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transition: isDragging ? "none" : "transform 0.25s ease",
                  cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
                  touchAction: "none",
                  willChange: "transform",
                }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-2 text-center">
              <p className="font-sans text-sm" style={{ color: "oklch(1 0 0 / 0.7)" }}>
                {selected.name.replace(/\.[^.]+$/, "").replace(/-/g, " ")}
              </p>
              <span className="font-sans text-xs tabular-nums" style={{ color: "oklch(1 0 0 / 0.35)" }}>
                {selectedIndex + 1} / {displayImages.length}
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

          {/* Zoom controls + close */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); zoomOut() }}
              disabled={zoom === 1}
              aria-label="Reduzir"
              title="Reduzir (0)"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-default"
              style={{ background: "oklch(1 0 0 / 0.1)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); zoomIn() }}
              disabled={zoom === 2}
              aria-label="Ampliar"
              title="Ampliar (duplo-clique)"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-default"
              style={{ background: "oklch(1 0 0 / 0.1)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
                <line x1="8" y1="11" x2="14" y2="11" />
                <line x1="11" y1="8" x2="11" y2="14" />
              </svg>
            </button>
            <button
              onClick={closeLightbox}
              aria-label="Fechar"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "oklch(1 0 0 / 0.1)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
