import Link from "next/link"

interface NavItem {
  slug: string
  title: string
}

interface DocNavProps {
  items: NavItem[]
  current: string
  basePath: string
}

export function DocNav({ items, current, basePath }: DocNavProps) {
  const idx = items.findIndex((i) => i.slug === current)
  const prev = idx > 0 ? items[idx - 1] : null
  const next = idx < items.length - 1 ? items[idx + 1] : null

  if (!prev && !next) return null

  return (
    <nav
      aria-label="Navegação entre documentos"
      className="flex items-center justify-between pt-8 mt-8"
    >
      {prev ? (
        <Link
          href={`${basePath}/${prev.slug}`}
          title={prev.title}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-sans truncate max-w-[200px]">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`${basePath}/${next.slug}`}
          title={next.title}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm transition-colors"
        >
          <span className="text-xs font-sans truncate max-w-[200px]">{next.title}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
