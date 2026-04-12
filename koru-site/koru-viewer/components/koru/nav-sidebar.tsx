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

const bibliaParts = [
  { parte: "parte-00", title: "Introdução" },
  { parte: "parte-01", title: "Física e Cosmologia" },
  { parte: "parte-02", title: "Geografia" },
  { parte: "parte-03", title: "Ecossistema" },
  { parte: "parte-04", title: "Criaturas" },
  { parte: "parte-05", title: "Personagens" },
  { parte: "parte-06", title: "Regras" },
  { parte: "parte-07", title: "Cultura" },
  { parte: "parte-08", title: "Linha do Tempo" },
]

const livroChapters = [
  { slug: "01", title: "Capítulo 1" },
  { slug: "02", title: "Capítulo 2" },
  { slug: "03", title: "Capítulo 3" },
  { slug: "04", title: "Capítulo 4" },
  { slug: "05", title: "Capítulo 5" },
  { slug: "06", title: "Capítulo 6" },
  { slug: "epilogo", title: "Epílogo" },
]

const contos = [
  { slug: "temiku", title: "Temiku" },
  { slug: "amara", title: "Amara" },
  { slug: "oruku", title: "Oruku" },
  { slug: "beku", title: "Beku" },
  { slug: "obaru", title: "Obaru" },
  { slug: "kemdi", title: "Kemdi" },
  { slug: "orike", title: "Orike" },
]

const personagens = [
  { slug: "temiku", title: "Temiku" },
  { slug: "amara", title: "Amara" },
  { slug: "oruku", title: "Oruku" },
  { slug: "beku", title: "Beku" },
  { slug: "obaru", title: "Obaru" },
  { slug: "kemdi", title: "Kemdi" },
  { slug: "orike", title: "Orike" },
]

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
              {bibliaParts.map((part) => (
                <NavItem key={part.parte} href={`/biblia/${part.parte}`}>
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
              {livroChapters.map((ch) => (
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
              {contos.map((conto) => (
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
              {personagens.map((p) => (
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

        <SidebarGroup>
          <SidebarGroupLabel
            className="text-xs uppercase tracking-[0.15em] font-sans opacity-65"
            style={{ color: "var(--foreground)" }}
          >
            Referência
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem href="/briefing">Briefing do Mundo</NavItem>
              <NavItem href="/workflow">Workflow</NavItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
