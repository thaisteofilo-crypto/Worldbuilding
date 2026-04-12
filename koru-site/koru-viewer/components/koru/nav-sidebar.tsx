"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import {
  BIBLIA_ITEMS,
  LIVRO_ITEMS,
  CONTOS_ITEMS,
  PERSONAGENS_ITEMS,
} from "@/lib/navigation"

function NavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <li>
      <Link
        href={href}
        className="block py-1 font-sans text-sm transition-opacity hover:opacity-70"
        style={{
          color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
          fontWeight: isActive ? 600 : 400,
        }}
        aria-current={isActive ? "page" : undefined}
      >
        {children}
      </Link>
    </li>
  )
}

function CollapsibleSection({
  title,
  items,
  basePath,
}: {
  title: string
  items: { slug: string; title: string }[]
  basePath: string
}) {
  const pathname = usePathname()
  const isActiveSection = pathname.startsWith(basePath)
  const [open, setOpen] = React.useState(isActiveSection)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-1.5 font-sans text-lg font-medium transition-opacity hover:opacity-70"
        style={{
          color: "var(--foreground)",
        }}
      >
        {title}
      </button>
      {open && (
        <ul className="mt-1 mb-2">
          {items.map((item) => (
            <NavItem key={item.slug} href={`${basePath}/${item.slug}`}>
              {item.title}
            </NavItem>
          ))}
        </ul>
      )}
    </div>
  )
}

export function NavSidebar() {
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
            className="font-serif text-4xl leading-none transition-opacity hover:opacity-80 mb-4"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              color: "var(--foreground)",
            }}
          >
            Korú
          </Link>

          <CollapsibleSection title="Bíblia" items={BIBLIA_ITEMS} basePath="/biblia" />
          <CollapsibleSection title="Livro" items={LIVRO_ITEMS} basePath="/livro" />
          <CollapsibleSection title="Contos" items={CONTOS_ITEMS} basePath="/contos" />
          <CollapsibleSection title="Personagens" items={PERSONAGENS_ITEMS} basePath="/personagens" />

          <Link
            href="/galeria"
            className="py-1.5 font-sans text-lg font-medium transition-opacity hover:opacity-70"
            style={{
              color: "var(--foreground)",
            }}
          >
            Galeria
          </Link>
        </nav>
      </SidebarContent>
    </Sidebar>
  )
}
