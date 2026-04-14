import Link from "next/link"

interface NavItem {
  slug: string
  title: string
}

interface DocNavProps {
  items: NavItem[]
  current: string
  basePath: string
  position?: number
  total?: number
}

export function DocNav({ items, current, basePath, position, total }: DocNavProps) {
  const idx = items.findIndex((i) => i.slug === current)
  const prev = idx > 0 ? items[idx - 1] : null
  const next = idx < items.length - 1 ? items[idx + 1] : null

  // Derivar posição a partir dos items se não fornecida explicitamente
  const derivedPosition = position ?? (idx >= 0 ? idx + 1 : undefined)
  const derivedTotal = total ?? items.length

  if (!prev && !next) return null

  return (
    <nav
      aria-label="Navegação entre documentos"
      className="flex items-center justify-between pt-8 mt-8 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      {prev ? (
        <Link
          href={`${basePath}/${prev.slug}`}
          className="flex flex-col gap-1 group max-w-[45%] focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
          style={{ outlineColor: "var(--accent)" }}
        >
          <span
            className="text-xs font-sans uppercase tracking-[0.1em]"
            style={{ color: "var(--muted-foreground)" }}
          >
            ← Anterior
          </span>
          <span
            className="text-sm font-serif group-hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              color: "var(--foreground)",
            }}
          >
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {derivedPosition && derivedTotal ? (
        <span
          className="font-mono text-xs shrink-0 px-2"
          style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
          aria-label={`Documento ${derivedPosition} de ${derivedTotal}`}
        >
          {derivedPosition} · {derivedTotal}
        </span>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`${basePath}/${next.slug}`}
          className="flex flex-col gap-1 group items-end max-w-[45%] focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
          style={{ outlineColor: "var(--accent)" }}
        >
          <span
            className="text-xs font-sans uppercase tracking-[0.1em]"
            style={{ color: "var(--muted-foreground)" }}
          >
            Próximo →
          </span>
          <span
            className="text-sm font-serif text-right group-hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              color: "var(--foreground)",
            }}
          >
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
