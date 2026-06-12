"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/koru/theme-toggle"

const NAV_LINKS = [
  { label: "Bíblia", href: "#biblia" },
  { label: "Personagens", href: "#personagens" },
  { label: "Contos", href: "#contos" },
  { label: "Livro", href: "#livro" },
]

/**
 * Barra de navegação fixa da homepage.
 * Links de âncora para as seções da home; em mobile colapsa em menu hambúrguer.
 * Inclui os controles de admin e tema (antes flutuavam soltos no canto).
 */
export function HomeNav() {
  const [open, setOpen] = useState(false)

  return (
    <header
      className="fixed top-0 inset-x-0 z-50"
      style={{
        background: "hsl(var(--background) / 0.45)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
      }}
    >
      <nav
        className="flex items-center justify-between h-16 px-4 md:px-8"
        aria-label="Navegação principal"
      >
        <Link
          href="/"
          className="font-serif text-2xl md:text-3xl tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          onClick={() => setOpen(false)}
        >
          Korú
        </Link>

        {/* Links — desktop */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="px-4 py-2 rounded-full font-sans text-sm font-medium uppercase tracking-[0.14em] text-foreground/75 hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-muted opacity-30 hover:opacity-60"
            aria-label="Admin"
            title="Admin"
          >
            <Settings size={14} className="text-foreground" />
          </Link>
          <ThemeToggle />

          {/* Hambúrguer — mobile */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-muted"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="home-nav-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X size={16} className="text-foreground" />
            ) : (
              <Menu size={16} className="text-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Painel mobile */}
      {open && (
        <div
          id="home-nav-mobile"
          className="md:hidden"
          style={{ borderTop: "1px solid hsl(var(--border-shadcn) / 0.4)" }}
        >
          <ul className="flex flex-col px-4 py-3 gap-1" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block px-2 py-2.5 font-sans text-base font-medium uppercase tracking-[0.12em] text-foreground/80 hover:text-foreground transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
