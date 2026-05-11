"use client"

import { useCallback, useEffect, useState } from "react"

export interface GalleryImage {
  name: string
  url: string
  created_at: string | null
}

interface GalleryClientProps {
  initialImages: GalleryImage[]
}

export function GalleryClient({ initialImages }: GalleryClientProps) {
  // Lista inicial vem do server. Mantemos como state apenas para futuros refreshes
  // após upload/delete (hoje: nenhum, mas o ponto de extensão existe).
  const [images] = useState<GalleryImage[]>(initialImages)
  const [activeTag] = useState<string | null>(null)
  const [filtered] = useState<GalleryImage[]>([])
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const displayImages = activeTag !== null ? filtered : images

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
  }, [displayImages, selectedIndex])

  const goPrev = useCallback(() => {
    if (displayImages.length === 0) return
    const prev = (selectedIndex - 1 + displayImages.length) % displayImages.length
    setSelected(displayImages[prev])
    setSelectedIndex(prev)
  }, [displayImages, selectedIndex])

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
    <>
      {/* Count label injected via portal-less inline text — server already rendered the header.
          To keep server/client boundary clean, count is rendered here on the right. */}
      <div className="px-6 md:px-10 -mt-12 pb-4 flex justify-end">
        <div className="font-sans text-xs tabular-nums" style={{ color: "var(--muted-foreground)" }}>
          {`${displayImages.length} ${displayImages.length === 1 ? "imagem" : "imagens"}`}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 pb-10">
        {displayImages.length === 0 ? (
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
    </>
  )
}
