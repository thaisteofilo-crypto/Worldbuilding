"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface NavItem { slug: string; title: string }
interface DocEntry { label: string; path: string }
interface DocGroup { section: string; docs: DocEntry[] }

function docToSlug(doc: DocEntry, section: string): NavItem {
  const filename = doc.path.replace(/\.md$/, "").split("/").pop() ?? ""
  // Sidebar shows short name only (before " · ")
  const shortTitle = doc.label.includes(" · ") ? doc.label.split(" · ")[0] : doc.label
  if (section === "Bíblia") return { slug: filename, title: shortTitle }
  if (section === "Livro") {
    const slug = filename === "epilogo" ? "epilogo" : filename.replace(/^capitulo-/, "")
    return { slug, title: shortTitle }
  }
  // Contos: show character name only (before " · ")
  return { slug: filename.replace(/^conto-/, ""), title: shortTitle }
}

const ICONS = {
  biblia: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  livro: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  contos: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  personagens: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  galeria: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  chevron: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
}

function SubLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "block py-1.5 pl-10 pr-3 rounded-lg font-sans text-[13px] koru-nav-item",
        isActive
          ? "bg-admin-active text-foreground font-medium"
          : "text-muted-foreground hover:bg-admin-hover hover:text-foreground",
      )}
    >
      {children}
    </Link>
  )
}

function Section({
  title,
  icon,
  items,
  basePath,
}: {
  title: string
  icon: React.ReactNode
  items: NavItem[]
  basePath: string
}) {
  const pathname = usePathname()
  const isActiveSection = pathname.startsWith(basePath)
  const [open, setOpen] = React.useState(isActiveSection)

  React.useEffect(() => {
    if (isActiveSection) setOpen(true)
  }, [isActiveSection])

  const hasItems = items.length > 0

  return (
    <div>
      <button
        onClick={() => hasItems && setOpen(!open)}
        className={cn(
          "flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 font-sans text-sm koru-nav-item",
          isActiveSection
            ? "bg-admin-active text-foreground font-medium"
            : "text-muted-foreground hover:bg-admin-hover hover:text-foreground",
        )}
      >
        <span className={isActiveSection ? "opacity-100" : "opacity-45"}>{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        {hasItems && (
          <span
            className="opacity-45 transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            {ICONS.chevron}
          </span>
        )}
      </button>
      {open && hasItems && (
        <div className="mt-0.5 mb-0.5 flex flex-col gap-0.5">
          {items.map((item) => (
            <SubLink key={item.slug} href={`${basePath}/${item.slug}`}>
              {item.title}
            </SubLink>
          ))}
        </div>
      )}
    </div>
  )
}

function FlatLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + "/")
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-sans text-sm koru-nav-item",
        isActive
          ? "bg-admin-active text-foreground font-medium"
          : "text-muted-foreground hover:bg-admin-hover hover:text-foreground",
      )}
    >
      <span className={isActive ? "opacity-100" : "opacity-45"}>{icon}</span>
      {label}
    </Link>
  )
}

export function NavSidebar() {
  const [bibliaItems, setBibliaItems] = React.useState<NavItem[]>([])
  const [livroItems, setLivroItems] = React.useState<NavItem[]>([])
  const [contosItems, setContosItems] = React.useState<NavItem[]>([])
  const [personagensItems, setPersonagensItems] = React.useState<NavItem[]>([])
  const [loadError, setLoadError] = React.useState(false)

  React.useEffect(() => {
    fetch("/api/docs")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        const groups: DocGroup[] = data.groups ?? []
        const biblia = groups.find((g) => g.section === "Bíblia")?.docs ?? []
        const livro = groups.find((g) => g.section === "Livro")?.docs ?? []
        const contos = groups.find((g) => g.section === "Contos")?.docs ?? []
        setBibliaItems(biblia.map((d) => docToSlug(d, "Bíblia")))
        setLivroItems(livro.map((d) => docToSlug(d, "Livro")))
        setContosItems(contos.map((d) => docToSlug(d, "Contos")))
        setPersonagensItems(data.personagens ?? [])
      })
      .catch(() => setLoadError(true))
  }, [])

  return (
    <Sidebar
      style={{ width: "240px" }}
      className="border-none border-0 shadow-none bg-background"
      aria-label="Navegação principal"
    >
      <SidebarContent className="bg-background">
        {/* Logo */}
        <div className="flex h-14 items-center px-5 pt-3">
          <Link
            href="/"
            className="font-serif text-2xl tracking-tight text-foreground transition-[letter-spacing,color] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:tracking-wide"
            style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "none", filter: "none", fontWeight: 400 }}
          >
            Korú
          </Link>
        </div>

        {/* Search */}
        <div className="px-3 pt-2">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("koru:open-search"))}
            aria-label="Buscar (Ctrl+K)"
            className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 font-sans text-sm text-muted-foreground koru-nav-item hover:bg-admin-hover hover:text-foreground"
            style={{ border: "1px solid var(--border)" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="opacity-45">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="flex-1 text-left">Buscar</span>
            <kbd className="text-[10px] px-1.5 py-px rounded opacity-60" style={{ border: "1px solid var(--border)" }}>
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 pt-2 flex-1">
          {loadError && (
            <p className="font-sans text-xs italic px-3 py-2 text-muted-foreground">
              Documentos indisponíveis
            </p>
          )}

          <Section title="Bíblia" icon={ICONS.biblia} items={bibliaItems} basePath="/biblia" />
          <Section title="Personagens" icon={ICONS.personagens} items={personagensItems} basePath="/personagens" />
          <Section title="Contos" icon={ICONS.contos} items={contosItems} basePath="/contos" />
          <Section title="Livro" icon={ICONS.livro} items={livroItems} basePath="/livro" />
          <FlatLink href="/galeria" icon={ICONS.galeria} label="Galeria" />
        </nav>
      </SidebarContent>
    </Sidebar>
  )
}
