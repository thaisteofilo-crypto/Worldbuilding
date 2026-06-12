"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface KeyboardNavProps {
  prevHref?: string | null
  nextHref?: string | null
}

/**
 * Navegação por teclado: ← documento anterior, → próximo documento.
 * Ignora quando o foco está em campos editáveis ou quando há modal aberto.
 * Não renderiza nada.
 */
export function KeyboardNav({ prevHref, nextHref }: KeyboardNavProps) {
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
      // Não interceptar atalhos do navegador/SO (Alt+←, etc.)
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return

      const active = document.activeElement as HTMLElement | null
      if (active) {
        const tag = active.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
        if (active.isContentEditable) return
        if (active.closest('[contenteditable="true"]')) return
        // Foco dentro de um modal (ex.: busca Cmd+K)
        if (active.closest('[role="dialog"], [role="alertdialog"]')) return
      }
      // Modal aberto em qualquer lugar da página
      if (
        document.querySelector(
          '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], dialog[open]'
        )
      )
        return

      if (e.key === "ArrowLeft" && prevHref) {
        router.push(prevHref)
      } else if (e.key === "ArrowRight" && nextHref) {
        router.push(nextHref)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [router, prevHref, nextHref])

  return null
}
