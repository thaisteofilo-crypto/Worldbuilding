"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, BookMarked, FileText, Users, Images, MessageCircle, ChevronRight, Search, LogOut } from "lucide-react"
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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


// Em telas < lg a sidebar vira um Sheet (offcanvas); ao navegar por um link
// ela precisa fechar, senão fica aberta cobrindo o conteúdo da nova página.
function useCloseMobileSidebar() {
  const { isMobile, setOpenMobile } = useSidebar()
  return React.useCallback(() => {
    if (isMobile) setOpenMobile(false)
  }, [isMobile, setOpenMobile])
}

function SubLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  const closeMobile = useCloseMobileSidebar()
  return (
    <Link
      href={href}
      onClick={closeMobile}
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
      <Button
        variant="ghost"
        onClick={() => hasItems && setOpen(!open)}
        className={cn(
          "flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 font-sans text-sm koru-nav-item h-auto justify-start",
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
            <ChevronRight size={12} />
          </span>
        )}
      </Button>
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
  const closeMobile = useCloseMobileSidebar()
  return (
    <Link
      href={href}
      onClick={closeMobile}
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

function SidebarLogo() {
  const closeMobile = useCloseMobileSidebar()
  return (
    <div className="flex h-14 items-center px-5 pt-3">
      <Link
        href="/"
        onClick={closeMobile}
        className="font-serif text-2xl tracking-tight text-foreground transition-[letter-spacing,color] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:tracking-wide"
        style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "none", filter: "none", fontWeight: 400 }}
      >
        Korú
      </Link>
    </div>
  )
}

export function NavSidebar() {
  const router = useRouter()
  const [bibliaItems, setBibliaItems] = React.useState<NavItem[]>([])
  const [livroItems, setLivroItems] = React.useState<NavItem[]>([])
  const [contosItems, setContosItems] = React.useState<NavItem[]>([])
  const [personagensItems, setPersonagensItems] = React.useState<NavItem[]>([])
  const [loadError, setLoadError] = React.useState(false)

  async function handleSignOut() {
    await fetch('/api/auth/sign-out', { method: 'POST' })
    router.push('/entrar')
  }

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
        <SidebarLogo />

        {/* Search */}
        <div className="px-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => window.dispatchEvent(new CustomEvent("koru:open-search"))}
            aria-label="Buscar (Ctrl+K)"
            className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 font-sans text-sm text-muted-foreground koru-nav-item hover:bg-admin-hover hover:text-foreground h-auto justify-start"
            style={{ border: "1px solid hsl(var(--border-shadcn))" }}
          >
            <Search size={14} aria-hidden="true" className="opacity-45" />
            <span className="flex-1 text-left">Buscar</span>
            <kbd className="text-[11px] px-1.5 py-px rounded opacity-60" style={{ border: "1px solid hsl(var(--border-shadcn))" }}>
              ⌘K
            </kbd>
          </Button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-0.5 p-3 pt-2">
            {loadError && (
              <p className="font-sans text-xs italic px-3 py-2 text-muted-foreground">
                Documentos indisponíveis
              </p>
            )}

            <Section title="Bíblia" icon={<BookOpen size={16} />} items={bibliaItems} basePath="/biblia" />
            <Section title="Personagens" icon={<Users size={16} />} items={personagensItems} basePath="/personagens" />
            <Section title="Contos" icon={<FileText size={16} />} items={contosItems} basePath="/contos" />
            <Section title="Livro" icon={<BookMarked size={16} />} items={livroItems} basePath="/livro" />
            <FlatLink href="/galeria" icon={<Images size={16} />} label="Galeria" />
            <FlatLink href="/perguntas-ao-mundo" icon={<MessageCircle size={16} />} label="Perguntas ao mundo" />
          </nav>
        </ScrollArea>

        {/* Rodapé: sair */}
        <div className="px-3 pb-4 pt-2 border-t border-border/40">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 font-sans text-sm text-muted-foreground koru-nav-item hover:bg-admin-hover hover:text-foreground h-auto justify-start"
          >
            <LogOut size={14} className="opacity-45" aria-hidden="true" />
            Sair
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
