"use client"

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react"

/**
 * Recommended `sizes` value for Image components inside carousel cards.
 * Pass this to every <Image> inside a .carousel-card to generate optimal srcsets.
 *
 * Usage: <Image sizes={CAROUSEL_IMAGE_SIZES} ... />
 */
export const CAROUSEL_IMAGE_SIZES =
  "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"

/** Instantly set scrollLeft, bypassing the container's scroll-smooth. */
function jumpTo(el: HTMLElement, left: number) {
  const prev = el.style.scrollBehavior
  el.style.scrollBehavior = "auto"
  el.scrollLeft = left
  el.style.scrollBehavior = prev
}

export function CardCarousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  // Infinite loop: only enabled once we know the content overflows the viewport
  // (with few cards there is nothing to loop). Enabling renders 3 copies of the
  // cards; the scroll position is kept inside the middle copy by silent jumps
  // of exactly one period, which are invisible because the content repeats.
  const [looping, setLooping] = useState(false)
  const childCount = React.Children.count(children)

  // Distance between a card and its clone one copy ahead (N cards + N gaps).
  const getPeriod = useCallback(() => {
    const el = scrollRef.current
    if (!el || el.children.length <= childCount) return 0
    const first = el.children[0] as HTMLElement
    const firstOfNextCopy = el.children[childCount] as HTMLElement
    return firstOfNextCopy.offsetLeft - first.offsetLeft
  }, [childCount])

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    if (looping) {
      const period = getPeriod()
      if (period > 0) {
        // Keep scrollLeft inside the middle copy, with half a period of slack
        // on each side so smooth scrolls never run out of cards.
        if (el.scrollLeft < period * 0.5) jumpTo(el, el.scrollLeft + period)
        else if (el.scrollLeft > period * 1.5) jumpTo(el, el.scrollLeft - period)
      }
      setCanScrollLeft(true)
      setCanScrollRight(true)
      return
    }
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [looping, getPeriod])

  // Decide whether to loop: content (single copy) wider than the viewport.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const measure = () => {
      const singleWidth = looping ? getPeriod() : el.scrollWidth
      setLooping(singleWidth > el.clientWidth + 4)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [looping, getPeriod])

  // When the loop turns on, shift from the leading clones to the middle copy.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || !looping) return
    const period = getPeriod()
    if (period > 0) jumpTo(el, el.scrollLeft + period)
  }, [looping, getPeriod])

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
  // `copy` 1 is the original set; 0 and 2 are the loop clones, hidden from the
  // accessibility tree and tab order (their links duplicate the originals).
  const renderCopy = (copy: 0 | 1 | 2) =>
    React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child
      const clone = copy !== 1
      return React.cloneElement(
        child as React.ReactElement<{ "data-carousel-index"?: number; "aria-hidden"?: boolean; tabIndex?: number }>,
        {
          key: `copy${copy}-${child.key ?? index}`,
          "data-carousel-index": index,
          ...(clone ? { "aria-hidden": true, tabIndex: -1 } : {}),
        },
      )
    })

  return (
    // Full-bleed: cancels the px-4 md:px-16 of the homepage <FullSection> so the
    // strip runs edge to edge; the scroller re-adds it as inner padding so the
    // first card still lines up with the section text.
    <div className="relative group/carousel -mx-4 md:-mx-16">
      {/* Scroll container.
          py-6 -my-6: with overflow-x:auto the browser silently promotes
          overflow-y to auto too, which clips the hover scale on the cards.
          Generous vertical padding inside the scroller (matched by negative
          margins outside) gives the scaled cards room to breathe.
          scroll-snap proximity > mandatory: lets the user free-scroll without
          the snap fighting momentum at every card boundary. */}
      {/* scroll-px deve casar com o px interno: o snap alinha os cards à
          scroll-padding, e um valor menor que o padding puxa a fila para a
          borda e corta o primeiro card. */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth py-6 -my-6 px-4 md:px-16 scroll-px-4 md:scroll-px-16"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x proximity",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {looping && renderCopy(0)}
        {renderCopy(1)}
        {looping && renderCopy(2)}
      </div>

      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-0 group-hover/carousel:opacity-100 hover:scale-[1.06] z-10"
          style={{
            background: "hsl(var(--background) / 0.5)",
            backdropFilter: "blur(16px)",
          }}
          aria-label="Anterior"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-0 group-hover/carousel:opacity-100 hover:scale-[1.06] z-10"
          style={{
            background: "hsl(var(--background) / 0.5)",
            backdropFilter: "blur(16px)",
          }}
          aria-label="Próximo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      )}

    </div>
  )
}
