"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { NavSidebar } from "@/components/koru/nav-sidebar"
import { Breadcrumb } from "@/components/koru/breadcrumb"
import { SearchModal } from "@/components/koru/search-modal"

function ViewTransitions() {
  const router = useRouter()

  useEffect(() => {
    if (!("startViewTransition" in document)) return

    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a")
      if (!target) return

      const href = target.getAttribute("href")
      if (!href) return

      // Only intercept internal links (not external, not hash-only, not mailto/tel)
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      ) return

      // Skip if modifier keys held (open in new tab etc.)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return

      e.preventDefault()
      ;(document as Document & { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => {
          router.push(href)
        })
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [router])

  return null
}

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [searchOpen, setSearchOpen] = useState(false)

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <SidebarProvider defaultOpen={true}>
      <ViewTransitions />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:text-sm focus:rounded focus:font-sans"
        style={{ backgroundColor: "var(--accent)", color: "var(--background)" }}
      >
        Pular para conteúdo principal
      </a>
      <NavSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 h-10" style={{ background: "var(--background)" }}>
          <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />
          <Breadcrumb />

          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Abrir busca global (Ctrl+K)"
            className="ml-auto flex items-center gap-1.5 font-sans text-xs rounded-md px-2.5 py-1 transition-colors"
            style={{
              color: "var(--muted-foreground)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--foreground)"
              e.currentTarget.style.borderColor = "var(--accent)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--muted-foreground)"
              e.currentTarget.style.borderColor = "var(--border)"
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Buscar</span>
            <kbd
              className="hidden sm:inline-block text-[10px] px-1 py-px rounded"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
              }}
            >
              ⌘K
            </kbd>
          </button>
        </header>
        <main id="main-content" className="flex-1">{children}</main>
      </SidebarInset>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </SidebarProvider>
  )
}
