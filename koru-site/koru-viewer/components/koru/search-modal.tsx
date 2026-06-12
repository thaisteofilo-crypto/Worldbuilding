"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface SearchResult {
  title: string
  section: string
  slug: string
  url: string
  excerpt: string
  matchCount: number
}

const SECTION_COLORS: Record<string, string> = {
  "Bíblia": "var(--color-mel)",
  "Livro": "var(--color-jala)",
  "Contos": "hsl(var(--primary))",
}

function highlightTerm(text: string, query: string): React.ReactNode {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        style={{
          background: "hsl(var(--primary) / 0.2)",
          color: "hsl(var(--primary))",
          fontWeight: 600,
          borderRadius: "2px",
          padding: "0 1px",
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  )
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input when modal opens
  React.useEffect(() => {
    if (open) {
      setQuery("")
      setResults([])
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        const data: SearchResult[] = await res.json()
        setResults(data)
        setActiveIndex(0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Keyboard navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (results.length === 0) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const result = results[activeIndex]
        if (result) {
          router.push(result.url)
          onClose()
        }
      }
    },
    [results, activeIndex, router, onClose]
  )

  // Scroll active item into view
  React.useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-active="true"]`) as HTMLElement | null
      activeEl?.scrollIntoView({ block: "nearest" })
    }
  }, [activeIndex])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "hsl(var(--background) / 0.6)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca global"
        className="fixed z-50 left-1/2 top-[15%] w-full max-w-lg -translate-x-1/2"
        style={{ padding: "0 1rem" }}
      >
        <div
          className="glass-card rounded-xl overflow-hidden"
          style={{
            border: "1px solid hsl(var(--border-shadcn))",
            boxShadow: "0 24px 64px hsl(var(--foreground) / 0.2)",
          }}
          onKeyDown={handleKeyDown}
        >
          {/* Input row */}
          <div
            className="flex items-center gap-3 px-4"
            style={{ borderBottom: "1px solid hsl(var(--border-shadcn))" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }}
            >
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            <Input
              ref={inputRef}
              type="search"
              placeholder="Buscar em Korú..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 py-4 bg-transparent font-sans text-sm outline-none border-0 ring-0 focus-visible:ring-0 focus-visible:border-0 h-auto rounded-none px-0"
              style={{ color: "hsl(var(--foreground))" }}
              spellCheck={false}
              autoComplete="off"
            />

            {loading && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-label="Carregando"
                style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0, animation: "spin 0.8s linear infinite" }}
              >
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10" />
              </svg>
            )}

            <kbd
              className="font-sans text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "hsl(var(--muted))",
                color: "hsl(var(--muted-foreground))",
                border: "1px solid hsl(var(--border-shadcn))",
                flexShrink: 0,
              }}
            >
              Esc
            </kbd>
          </div>

          {/* Results */}
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <div className="px-4 py-8 text-center font-sans text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Nenhum resultado para{" "}
              <span style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>"{query}"</span>
            </div>
          )}

          {results.length > 0 && (
            <ul
              ref={listRef}
              role="listbox"
              aria-label="Resultados da busca"
              className="py-2 overflow-y-auto"
              style={{ maxHeight: "calc(70vh - 60px)" }}
            >
              {results.map((result, i) => {
                const sectionColor = SECTION_COLORS[result.section] ?? "hsl(var(--primary))"
                const isActive = i === activeIndex

                return (
                  <li
                    key={`${result.section}-${result.slug}`}
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive ? "true" : undefined}
                  >
                    <Button
                      variant="ghost"
                      className="w-full text-left px-4 py-3 transition-colors h-auto rounded-none justify-start"
                      style={{
                        background: isActive ? "hsl(var(--primary) / 0.08)" : "transparent",
                        cursor: "pointer",
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => {
                        router.push(result.url)
                        onClose()
                      }}
                    >
                      {/* Title row */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-serif text-sm"
                          style={{ color: "hsl(var(--foreground))", flex: 1, lineHeight: 1.4 }}
                        >
                          {highlightTerm(result.title, query)}
                        </span>
                        <span
                          className="font-sans text-[11px] uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-full shrink-0"
                          style={{
                            background: `color-mix(in oklch, ${sectionColor} 15%, transparent)`,
                            color: sectionColor,
                            border: `1px solid color-mix(in oklch, ${sectionColor} 30%, transparent)`,
                          }}
                        >
                          {result.section}
                        </span>
                      </div>

                      {/* Excerpt */}
                      <p
                        className="font-sans text-xs leading-relaxed line-clamp-2"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        {highlightTerm(result.excerpt, query)}
                      </p>
                    </Button>

                    {/* Separator (between items, not after last) */}
                    {i < results.length - 1 && (
                      <div style={{ height: "1px", background: "hsl(var(--border-shadcn))", margin: "0 16px" }} />
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {/* Footer hint */}
          {results.length > 0 && (
            <div
              className="flex items-center gap-4 px-4 py-2.5"
              style={{ borderTop: "1px solid hsl(var(--border-shadcn))" }}
            >
              <span className="flex items-center gap-1 font-sans text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                <kbd className="px-1 py-0.5 rounded text-[11px]" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border-shadcn))" }}>↑↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1 font-sans text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                <kbd className="px-1 py-0.5 rounded text-[11px]" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border-shadcn))" }}>↵</kbd>
                abrir
              </span>
              <span className="flex items-center gap-1 font-sans text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                <kbd className="px-1 py-0.5 rounded text-[11px]" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border-shadcn))" }}>Esc</kbd>
                fechar
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
