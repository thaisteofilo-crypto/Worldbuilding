"use client"

import { useEffect, useState } from "react"
import type { TocHeading } from "@/components/koru/content-utils"

interface TocProps {
  items: TocHeading[]
}

// Largura mínima necessária para a coluna do sumário (px)
const MIN_WIDTH = 176
const MAX_WIDTH = 232
const GAP = 24
// Metade de max-w-4xl (896px) — largura da coluna da bíblia em xl+ (o Toc só
// aparece em xl+, então usamos sempre a medida larga). A coluna é centrada
// na área de conteúdo ao lado da sidebar.
const HALF_CONTENT = 448

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

/**
 * Sumário flutuante (coluna à direita, telas xl+) para documentos da bíblia.
 * Posição calculada a partir do viewport do ScrollArea, para nunca
 * sobrepor a coluna de texto (que é centrada na área ao lado da sidebar).
 * Scroll-spy via IntersectionObserver; clique rola suavemente até a seção.
 */
export function Toc({ items }: TocProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pos, setPos] = useState<{ left: number; width: number } | null>(null)
  const [pastHero, setPastHero] = useState(false)

  // Mede o espaço disponível à direita da coluna de texto
  useEffect(() => {
    const viewport = findViewport()
    if (!viewport) return

    function measure() {
      const rect = viewport!.getBoundingClientRect()
      const contentRight = rect.left + rect.width / 2 + HALF_CONTENT
      const available = window.innerWidth - contentRight
      if (window.innerWidth >= 1280 && available >= MIN_WIDTH + GAP * 2) {
        setPos({
          left: contentRight + GAP,
          width: Math.min(available - GAP * 2, MAX_WIDTH),
        })
      } else {
        setPos(null)
      }
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(viewport)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  // Só mostra depois do hero, para não flutuar sobre a imagem do banner
  useEffect(() => {
    const viewport = findViewport()
    if (!viewport) return

    function onScroll() {
      setPastHero(viewport!.scrollTop > 280)
    }

    onScroll()
    viewport.addEventListener("scroll", onScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", onScroll)
  }, [])

  // Scroll-spy: destaca a seção visível mais ao topo
  useEffect(() => {
    const viewport = findViewport()
    if (!viewport || items.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        for (const item of items) {
          if (visible.has(item.id)) {
            setActiveId(item.id)
            return
          }
        }
      },
      { root: viewport, rootMargin: "0px 0px -55% 0px" }
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [items])

  if (items.length < 3) return null

  function scrollToHeading(id: string) {
    const viewport = findViewport()
    const el = document.getElementById(id)
    if (!viewport || !el) return
    const top =
      el.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top +
      viewport.scrollTop -
      24
    viewport.scrollTo({ top: Math.max(top, 0), behavior: "smooth" })
  }

  return (
    <nav
      aria-label="Sumário"
      className={`fixed top-28 z-30 hidden max-h-[calc(100vh-11rem)] overflow-y-auto pr-2 transition-opacity duration-300 xl:block ${
        pos && pastHero ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={pos ? { left: pos.left, width: pos.width } : { left: -9999, width: MIN_WIDTH }}
    >
      <p className="mb-3 font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Sumário
      </p>
      <ul className="space-y-0.5 border-l border-border/50">
        {items.map((item, index) => {
          const active = item.id === activeId
          return (
            <li key={`${item.id}-${index}`}>
              <button
                type="button"
                onClick={() => scrollToHeading(item.id)}
                aria-current={active ? "true" : undefined}
                className={`-ml-px block w-full border-l py-1 text-left font-sans text-xs leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  item.level === 3 ? "pl-6" : "pl-3"
                } ${
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.text}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
