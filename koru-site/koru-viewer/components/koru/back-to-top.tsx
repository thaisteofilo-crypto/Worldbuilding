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

/**
 * Botão flutuante "voltar ao topo". Aparece depois de ~600px de scroll
 * do viewport do ScrollArea e rola suavemente de volta ao início.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const viewport = findViewport()
    if (!viewport) return

    function onScroll() {
      setVisible(viewport!.scrollTop > 600)
    }

    onScroll()
    viewport.addEventListener("scroll", onScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", onScroll)
  }, [])

  function scrollToTop() {
    findViewport()?.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/85 text-muted-foreground shadow-card backdrop-blur-sm transition-all duration-300 hover:text-foreground hover:border-primary/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        visible
          ? "opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 translate-y-2"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
