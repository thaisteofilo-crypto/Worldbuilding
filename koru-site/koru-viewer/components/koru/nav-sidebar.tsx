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
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel
            className="text-xs uppercase tracking-[0.15em] font-sans"
            style={{ color: "var(--foreground)" }}
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
            style={{ color: "var(--foreground)" }}
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
            style={{ color: "var(--foreground)" }}
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
            className="text-xs uppercase tracking-[0.15em] font-sans"
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
      </SidebarContent>
    </Sidebar>
  )
}
