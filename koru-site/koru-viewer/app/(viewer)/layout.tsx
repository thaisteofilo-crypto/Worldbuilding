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

  // Global Cmd+K / Ctrl+K listener + custom event from sidebar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    function handleOpenSearch() { setSearchOpen(true) }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("koru:open-search", handleOpenSearch)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("koru:open-search", handleOpenSearch)
    }
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
        </header>
        <main id="main-content" className="flex-1">{children}</main>
      </SidebarInset>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </SidebarProvider>
  )
}
