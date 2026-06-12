"use client"

interface GlossaryTermProps {
  term: string
  definition: string
  category: string
  children: React.ReactNode
}

const CATEGORY_LABELS: Record<string, string> = {
  fisica: "Física",
  criatura: "Criatura",
  personagem: "Personagem",
  lugar: "Lugar",
  fenomeno: "Fenômeno",
}

export function GlossaryTerm({ term, definition, category, children }: GlossaryTermProps) {
  const displayCategory = CATEGORY_LABELS[category] ?? category
  return (
    <span className="relative inline-block group">
      {/* Trigger — focável: em touch, o toque foca e abre o tooltip */}
      <span
        tabIndex={0}
        className="cursor-help border-b-[1.5px] border-dotted border-primary transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        style={{ color: "inherit" }}
      >
        {children}
      </span>

      {/* Tooltip — CSS-only, no library. Largura limitada à viewport em telas estreitas. */}
      <span
        className="
          pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2
          w-64 max-w-[calc(100vw-2rem)] z-50
          opacity-0 translate-y-1
          group-hover:opacity-100 group-hover:translate-y-0
          group-focus-within:opacity-100 group-focus-within:translate-y-0
          transition-all duration-200 ease-out
        "
        role="tooltip"
        style={{ filter: "drop-shadow(0 4px 16px oklch(0 0 0 / 0.35))" }}
      >
        {/* Card */}
        <span className="block rounded-xl px-4 py-3 text-left bg-card border border-border">
          <span className="block font-serif text-sm font-medium mb-1 text-card-foreground">
            {term}
          </span>
          <span className="block font-sans text-xs leading-relaxed text-card-foreground opacity-85">
            {definition}
          </span>
          <span className="block font-sans text-[11px] uppercase tracking-wider mt-2 text-muted-foreground">
            {displayCategory}
          </span>
        </span>

        {/* Arrow */}
        <span
          className="block w-3 h-3 mx-auto -mt-[1px] rotate-45 rounded-sm bg-card border border-border"
          style={{
            clipPath: "polygon(0% 0%, 100% 100%, 0% 100%)",
          }}
          aria-hidden="true"
        />
      </span>
    </span>
  )
}
