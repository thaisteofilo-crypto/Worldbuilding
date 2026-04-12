"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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

export function NavSidebar() {
  return (
    <Sidebar
      style={{ width: "260px" }}
      className="border-none"
      aria-label="Navegação principal"
    >
      <SidebarHeader className="px-4 py-4">
        <Link
          href="/"
          className="font-serif text-2xl leading-none transition-opacity hover:opacity-80"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            color: "var(--foreground)",
          }}
        >
          Korú
        </Link>
        <p
          className="text-xs font-sans mt-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          Worldbuilding
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className="text-xs uppercase tracking-[0.15em] font-sans"
            style={{ color: "var(--gold)" }}
          >
            Bíblia
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {BIBLIA_ITEMS.map((part) => (
                <NavItem key={part.slug} href={`/biblia/${part.slug}`}>
                  {part.title}
                </NavItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            className="text-xs uppercase tracking-[0.15em] font-sans"
            style={{ color: "var(--accent)" }}
          >
            Livro
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {LIVRO_ITEMS.map((ch) => (
                <NavItem key={ch.slug} href={`/livro/${ch.slug}`}>
                  {ch.title}
                </NavItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            className="text-xs uppercase tracking-[0.15em] font-sans"
            style={{ color: "var(--blue-cold)" }}
          >
            Contos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CONTOS_ITEMS.map((conto) => (
                <NavItem key={conto.slug} href={`/contos/${conto.slug}`}>
                  {conto.title}
                </NavItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            className="text-xs uppercase tracking-[0.15em] font-sans opacity-65"
            style={{ color: "var(--foreground)" }}
          >
            Personagens
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PERSONAGENS_ITEMS.map((p) => (
                <NavItem key={p.slug} href={`/personagens/${p.slug}`}>
                  {p.title}
                </NavItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            className="text-xs uppercase tracking-[0.15em] font-sans opacity-65"
            style={{ color: "var(--foreground)" }}
          >
            Galeria
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem href="/galeria">Cenas do Akwu</NavItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
