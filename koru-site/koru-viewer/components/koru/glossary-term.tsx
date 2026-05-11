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
      {/* Trigger */}
      <span
        className="cursor-help border-b-[1.5px] border-dotted transition-colors duration-150"
        style={{ borderColor: "var(--accent)", color: "inherit" }}
      >
        {children}
      </span>

      {/* Tooltip — CSS-only, no library */}
      <span
        className="
          pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2
          w-64 max-w-xs z-50
          opacity-0 translate-y-1
          group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-200 ease-out
        "
        role="tooltip"
        style={{ filter: "drop-shadow(0 4px 16px oklch(0 0 0 / 0.35))" }}
      >
        {/* Glass card */}
        <span
          className="block rounded-xl px-4 py-3 text-left"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <span
            className="block font-sans text-sm font-medium mb-1"
            style={{ color: "var(--foreground)" }}
          >
            {term}
          </span>
          <span
            className="block font-sans text-xs leading-relaxed"
            style={{ color: "var(--foreground)", opacity: 0.85 }}
          >
            {definition}
          </span>
          <span
            className="block font-sans text-[10px] uppercase tracking-wider mt-2"
            style={{ color: "var(--muted-foreground)" }}
          >
            {displayCategory}
          </span>
        </span>

        {/* Arrow */}
        <span
          className="block w-3 h-3 mx-auto -mt-[1px] rotate-45 rounded-sm"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            clipPath: "polygon(0% 0%, 100% 100%, 0% 100%)",
          }}
          aria-hidden="true"
        />
      </span>
    </span>
  )
}
