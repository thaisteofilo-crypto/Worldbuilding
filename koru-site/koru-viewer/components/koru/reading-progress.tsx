"use client"

import { useEffect, useState } from "react"

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      // Find the scroll container (ScrollArea viewport)
      const scrollEl = document.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null
      if (!scrollEl) return

      const { scrollTop, scrollHeight, clientHeight } = scrollEl
      const maxScroll = scrollHeight - clientHeight
      if (maxScroll <= 0) { setProgress(0); return }
      setProgress(Math.min((scrollTop / maxScroll) * 100, 100))
    }

    // Attach to ScrollArea viewport
    const scrollEl = document.querySelector("[data-radix-scroll-area-viewport]")
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll, { passive: true })
      return () => scrollEl.removeEventListener("scroll", handleScroll)
    }
  }, [])

  if (progress <= 0) return null

  return (
    <div
      className="fixed top-0 left-0 z-50 h-[3px] transition-all duration-150 ease-out"
      style={{
        width: `${progress}%`,
        background: "var(--foreground)",
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso de leitura"
    />
  )
}
