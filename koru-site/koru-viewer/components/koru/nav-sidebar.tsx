"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
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
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          href={href}
          className="font-sans text-sm"
          aria-current={isActive ? "page" : undefined}
        >
          {children}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
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
    <SidebarGroup>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-1.5 font-serif text-2xl transition-opacity hover:opacity-70"
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          color: "var(--foreground)",
        }}
      >
        {title}
      </button>
      {open && (
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <NavItem key={item.slug} href={`${basePath}/${item.slug}`}>
                {item.title}
              </NavItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  )
}

export function NavSidebar() {
  return (
    <Sidebar
      style={{ width: "260px" }}
      className="border-none"
      aria-label="Navegação principal"
    >
      <div className="px-4 pt-6 pb-2">
        <Link
          href="/"
          className="font-serif text-4xl leading-none transition-opacity hover:opacity-80"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            color: "var(--foreground)",
          }}
        >
          Korú
        </Link>
      </div>
      <SidebarContent className="pt-2 gap-0">
        <CollapsibleSection
          title="Bíblia"
          items={BIBLIA_ITEMS}
          basePath="/biblia"
        />
        <CollapsibleSection
          title="Livro"
          items={LIVRO_ITEMS}
          basePath="/livro"
        />
        <CollapsibleSection
          title="Contos"
          items={CONTOS_ITEMS}
          basePath="/contos"
        />
        <CollapsibleSection
          title="Personagens"
          items={PERSONAGENS_ITEMS}
          basePath="/personagens"
        />
        <SidebarGroup>
          <Link
            href="/galeria"
            className="px-3 py-1.5 font-serif text-2xl transition-opacity hover:opacity-70 block"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              color: "var(--foreground)",
            }}
          >
            Galeria
          </Link>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
