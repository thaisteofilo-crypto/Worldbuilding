"use client"

import { useEffect, useState } from "react"

// O viewport do conteúdo fica dentro de #main-content — a sidebar também
// usa ScrollArea, então um querySelector global pegaria o viewport errado.
function findViewport(): HTMLElement | null {
  return (document.querySelector(
    "#main-content [data-radix-scroll-area-viewport]"
  ) ??
    document.querySelector(
      "[data-radix-scroll-area-viewport]"
    )) as HTMLElement | null
}

interface ContentRect {
  top: number
  left: number
  width: number
}

/**
 * Barra de progresso de leitura (2px, cor primary) fixa no topo da área
 * de conteúdo (#main-content). Lê o scroll do viewport do ScrollArea.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const [rect, setRect] = useState<ContentRect | null>(null)

  useEffect(() => {
    const viewport = findViewport()
    if (!viewport) return

    const main = document.getElementById("main-content") ?? viewport

    function update() {
      const { scrollTop, scrollHeight, clientHeight } = viewport!
      const maxScroll = scrollHeight - clientHeight
      setProgress(
        maxScroll <= 0 ? 0 : Math.min((scrollTop / maxScroll) * 100, 100)
      )
      const r = main.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width })
    }

    update()
    viewport.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    // Acompanha mudanças de largura da área de conteúdo (ex.: sidebar abre/fecha)
    const observer = new ResizeObserver(update)
    observer.observe(main)

    return () => {
      viewport.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      observer.disconnect()
    }
  }, [])

  if (progress <= 0 || !rect) return null

  return (
    <div
      className="fixed z-30 h-[2px] pointer-events-none"
      style={{
        top: rect.top,
        left: rect.left,
        width: `${(rect.width * progress) / 100}px`,
        background: "var(--primary)",
        boxShadow: "0 0 8px var(--primary)",
        transition: "width 0.1s linear",
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso de leitura"
    />
  )
}
