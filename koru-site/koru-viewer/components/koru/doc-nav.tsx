import Link from "next/link"

interface NavItem {
  slug: string
  title: string
}

interface SectionTransition {
  href: string
  label: string
  description?: string
}

interface DocNavProps {
  items: NavItem[]
  current: string
  basePath: string
  sectionTransition?: SectionTransition
}

export function DocNav({ items, current, basePath, sectionTransition }: DocNavProps) {
  const idx = items.findIndex((i) => i.slug === current)
  const prev = idx > 0 ? items[idx - 1] : null
  const next = idx < items.length - 1 ? items[idx + 1] : null

  // When there is no internal "next" but a section transition is provided,
  // render the transition card in place of the (missing) next link.
  const showTransition = !next && !!sectionTransition

  if (!prev && !next && !showTransition) return null

  return (
    <>
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

      {showTransition && sectionTransition && (
        <Link
          href={sectionTransition.href}
          aria-label={sectionTransition.label}
          className="group relative block mt-10 rounded-xl border border-border bg-card px-8 py-10 md:px-10 md:py-12 transition-colors transition-transform duration-300 hover:border-muted-foreground/40 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span className="block font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Próximo capítulo da jornada
          </span>
          <span className="mt-3 block font-serif text-3xl md:text-4xl leading-tight text-foreground transition-colors">
            {sectionTransition.label}
          </span>
          {sectionTransition.description && (
            <span className="mt-3 block font-sans text-sm md:text-base text-muted-foreground max-w-prose">
              {sectionTransition.description}
            </span>
          )}
          <span className="mt-6 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-foreground">
            Continuar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      )}
    </>
  )
}
