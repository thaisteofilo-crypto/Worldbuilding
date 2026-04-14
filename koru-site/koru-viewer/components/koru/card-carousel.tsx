"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"

/**
 * Recommended `sizes` value for Image components inside carousel cards.
 * Pass this to every <Image> inside a .carousel-card to generate optimal srcsets.
 *
 * Usage: <Image sizes={CAROUSEL_IMAGE_SIZES} ... />
 */
export const CAROUSEL_IMAGE_SIZES =
  "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"

export function CardCarousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize", checkScroll)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll])

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector(":scope > *")?.clientWidth ?? 300
    el.scrollBy({
      left: direction === "left" ? -cardWidth - 8 : cardWidth + 8,
      behavior: "smooth",
    })
  }

  // Inject data-carousel-index on each direct child so downstream consumers
  // can determine whether an image should use priority (index < 3) or lazy loading.
  const indexedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child
    return React.cloneElement(child as React.ReactElement<{ "data-carousel-index"?: number }>, {
      "data-carousel-index": index,
    })
  })

  return (
    <div className="relative group/carousel">
      {/* Scroll container — scroll-smooth ensures smooth programmatic scrolling */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth py-3 -my-3"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x mandatory",
        }}
      >
        {indexedChildren}
      </div>

      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 hover:scale-105 z-10"
          style={{
            background: "oklch(1 0 0 / 0.2)",
            backdropFilter: "blur(16px)",
            border: "1px solid oklch(1 0 0 / 0.3)",
            boxShadow: "0 4px 12px oklch(0 0 0 / 0.2)",
          }}
          aria-label="Anterior"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 hover:scale-105 z-10"
          style={{
            background: "oklch(1 0 0 / 0.2)",
            backdropFilter: "blur(16px)",
            border: "1px solid oklch(1 0 0 / 0.3)",
            boxShadow: "0 4px 12px oklch(0 0 0 / 0.2)",
          }}
          aria-label="Próximo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      )}

      {/* Fade edges */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none z-[5]" style={{ background: "linear-gradient(to right, var(--background), transparent)" }} />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none z-[5]" style={{ background: "linear-gradient(to left, var(--background), transparent)" }} />
      )}
    </div>
  )
}
