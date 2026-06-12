"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"

interface LastRead {
  path: string
  title: string
  section: string
  ts: number
}

const STORAGE_KEY = "koru-last-read"

/**
 * Card "Continuar lendo" na home.
 * Lê `koru-last-read` do localStorage (gravado pelas páginas de leitura).
 * Renderiza null no SSR e só decide no cliente, evitando hydration mismatch.
 */
export function ContinueReadingCard() {
  const [lastRead, setLastRead] = useState<LastRead | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<LastRead>
      if (
        typeof parsed?.path === "string" && parsed.path.length > 0 &&
        typeof parsed?.title === "string" && parsed.title.length > 0
      ) {
        setLastRead(parsed as LastRead)
      }
    } catch {
      /* localStorage indisponível ou JSON inválido — não renderiza nada */
    }
  }, [])

  if (!lastRead) return null

  const href = lastRead.path.startsWith("/") ? lastRead.path : `/${lastRead.path}`

  return (
    <section className="px-4 sm:px-8 md:px-16 py-6 animate-fade-up" aria-label="Continuar lendo">
      <Link
        href={href}
        className="group flex items-center gap-4 max-w-3xl rounded-2xl border border-border/40 bg-background px-5 py-4 transition-colors duration-300 hover:border-primary/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BookOpen size={15} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-foreground">
            Continuar lendo{lastRead.section ? ` · ${lastRead.section}` : ""}
          </span>
          <span
            className="block truncate font-serif text-xl leading-snug text-foreground mt-0.5"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            {lastRead.title}
          </span>
        </span>
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-muted-foreground transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </Link>
    </section>
  )
}
