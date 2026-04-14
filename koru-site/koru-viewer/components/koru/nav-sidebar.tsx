"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"

interface NavItem { slug: string; title: string }
interface DocEntry { label: string; path: string }
interface DocGroup { section: string; docs: DocEntry[] }

function docToSlug(doc: DocEntry, section: string): NavItem {
  const filename = doc.path.replace(/\.md$/, "").split("/").pop() ?? ""
  if (section === "Bíblia") return { slug: filename, title: doc.label }
  if (section === "Livro") {
    const slug = filename === "epilogo" ? "epilogo" : filename.replace(/^capitulo-/, "")
    return { slug, title: doc.label }
  }
  // Contos
  return { slug: filename.replace(/^conto-/, ""), title: doc.label }
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <li>
      <Link
        href={href}
        className="block py-1 px-2 -mx-2 rounded font-sans text-sm transition-colors"
        style={{
          color: isActive ? "var(--accent)" : "var(--muted-foreground)",
          fontWeight: isActive ? 600 : 400,
          background: isActive
            ? "color-mix(in oklch, var(--accent) 10%, transparent)"
            : "transparent",
        }}
        aria-current={isActive ? "page" : undefined}
      >
        {children}
      </Link>
    </li>
  )
}

function CollapsibleSection({ title, items, basePath }: { title: string; items: NavItem[]; basePath: string }) {
  const pathname = usePathname()
  const isActiveSection = pathname.startsWith(basePath)
  const [open, setOpen] = React.useState(isActiveSection)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-1.5 font-sans text-lg font-medium transition-opacity hover:opacity-70"
        style={{ color: "var(--foreground)" }}
      >
        {title}
      </button>
      {open && (
        <ul className="mt-1 mb-2">
          {items.map((item) => (
            <NavLink key={item.slug} href={`${basePath}/${item.slug}`}>
              {item.title}
            </NavLink>
          ))}
        </ul>
      )}
    </div>
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
      style={{ width: "260px" }}
      className="border-none border-0 shadow-none"
      aria-label="Navegação principal"
    >
      <SidebarContent>
        <nav className="px-8 pt-6 flex flex-col gap-1">
          <Link
            href="/"
            className="font-serif text-5xl leading-none transition-opacity hover:opacity-80 mb-6"
            style={{ fontFamily: "var(--font-serif), Georgia, serif", color: "var(--foreground)" }}
          >
            Korú
          </Link>

          {loadError && (
            <p
              className="font-sans text-xs italic mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Documentos indisponíveis
            </p>
          )}

          <CollapsibleSection title="Bíblia" items={bibliaItems} basePath="/biblia" />
          <CollapsibleSection title="Livro" items={livroItems} basePath="/livro" />
          <CollapsibleSection title="Contos" items={contosItems} basePath="/contos" />
          <CollapsibleSection title="Personagens" items={personagensItems} basePath="/personagens" />

          <Link
            href="/galeria"
            className="py-1.5 font-sans text-lg font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--foreground)" }}
          >
            Galeria
          </Link>
        </nav>
      </SidebarContent>
    </Sidebar>
  )
}
