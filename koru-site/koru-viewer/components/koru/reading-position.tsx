"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const POS_KEY = "koru-reading-pos"
const LAST_KEY = "koru-last-read"

interface ReadingPositionProps {
  title: string
  section: string
}

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

function readPositions(): Record<string, number> {
  try {
    const raw = localStorage.getItem(POS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, number>)
      : {}
  } catch {
    return {}
  }
}

/**
 * Restaura e salva a posição de leitura por documento (localStorage),
 * e registra o último documento lido em `koru-last-read` para a home.
 * Não renderiza nada.
 */
export function ReadingPosition({ title, section }: ReadingPositionProps) {
  const pathname = usePathname()

  useEffect(() => {
    const viewport = findViewport()
    if (!viewport) return

    let currentTop = viewport.scrollTop

    // Restaura a posição salva para este documento
    const saved = readPositions()[pathname]
    if (typeof saved === "number" && saved > 0) {
      requestAnimationFrame(() => {
        viewport.scrollTop = saved
        currentTop = viewport.scrollTop
      })
    }

    function saveLastRead() {
      try {
        localStorage.setItem(
          LAST_KEY,
          JSON.stringify({ path: pathname, title, section, ts: Date.now() })
        )
      } catch {
        // localStorage indisponível — ignora
      }
    }

    function persist() {
      try {
        const positions = readPositions()
        positions[pathname] = currentTop
        localStorage.setItem(POS_KEY, JSON.stringify(positions))
      } catch {
        // localStorage indisponível — ignora
      }
      saveLastRead()
    }

    // Marca o documento atual como último lido mesmo sem scroll
    saveLastRead()

    // Throttle ~500ms com chamada final garantida
    let lastSave = 0
    let trailing: ReturnType<typeof setTimeout> | null = null

    function onScroll() {
      currentTop = viewport!.scrollTop
      const now = Date.now()
      if (now - lastSave >= 500) {
        lastSave = now
        persist()
        return
      }
      if (trailing) return
      trailing = setTimeout(() => {
        trailing = null
        lastSave = Date.now()
        persist()
      }, 500 - (now - lastSave))
    }

    viewport.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      viewport.removeEventListener("scroll", onScroll)
      if (trailing) clearTimeout(trailing)
      // Salva a última posição conhecida ao sair do documento
      persist()
    }
  }, [pathname, title, section])

  return null
}
