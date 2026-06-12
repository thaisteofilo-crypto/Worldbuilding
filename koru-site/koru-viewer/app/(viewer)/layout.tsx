"use client"

import { useEffect, useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Maximize2, Minimize2 } from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { NavSidebar } from "@/components/koru/nav-sidebar"
import { Breadcrumb } from "@/components/koru/breadcrumb"
import { FontScaleControl } from "@/components/koru/font-scale-control"
import Loading from "./loading"

// SearchModal is only ever shown when the user presses Cmd+K (or clicks the
// sidebar search). Loading it lazily keeps it out of the initial viewer bundle.
const SearchModal = dynamic(
  () => import("@/components/koru/search-modal").then((m) => m.SearchModal),
  { ssr: false }
)

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
  // Modo imersivo: oculta sidebar + chrome, deixando só o conteúdo.
  const [immersive, setImmersive] = useState(false)
  // Estado "real" da sidebar, preservado ao entrar/sair do modo imersivo.
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

  // Modo imersivo: "f" alterna (ignorando campos editáveis), Esc sai.
  useEffect(() => {
    function handleImmersiveKeys(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (!searchOpen) setImmersive(false)
        return
      }
      if (e.key !== "f" || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable]")) return
      e.preventDefault()
      setImmersive((prev) => !prev)
    }
    window.addEventListener("keydown", handleImmersiveKeys)
    return () => window.removeEventListener("keydown", handleImmersiveKeys)
  }, [searchOpen])

  return (
    <SidebarProvider
      open={immersive ? false : sidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <ViewTransitions />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:text-sm focus:rounded focus:font-sans"
        style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
      >
        Pular para conteúdo principal
      </a>
      <NavSidebar />
      <SidebarInset>
        {/* Header mantém a altura no modo imersivo (só some visualmente) para
            não deslocar os ScrollArea das páginas, que dependem de 100vh fixo.
            h-12 (3rem) precisa casar com o calc(100vh-3rem) dos ScrollArea
            das páginas de leitura — senão sobra uma faixa morta no rodapé. */}
        <header
          inert={immersive || undefined}
          className={`sticky top-0 z-10 flex items-center gap-3 px-4 h-12 transition-opacity duration-300 ${
            immersive ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{ background: "hsl(var(--background))" }}
        >
          <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />
          <Breadcrumb />
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <FontScaleControl />
            <button
              type="button"
              onClick={() => setImmersive(true)}
              aria-label="Modo imersivo"
              title="Modo imersivo (f)"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[var(--admin-hover)] hover:text-foreground"
            >
              <Maximize2 size={14} aria-hidden="true" />
            </button>
          </div>
        </header>
        <main id="main-content" className="flex-1">
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </main>
      </SidebarInset>

      {/* Saída do modo imersivo (além de Esc / f) */}
      {immersive && (
        <button
          type="button"
          onClick={() => setImmersive(false)}
          aria-label="Sair do modo imersivo"
          title="Sair do modo imersivo (Esc)"
          className="fixed top-3 right-4 z-50 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground opacity-40 transition-opacity duration-300 hover:opacity-100 hover:bg-[var(--admin-hover)] animate-fade-up"
        >
          <Minimize2 size={15} aria-hidden="true" />
        </button>
      )}

      {searchOpen && (
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      )}
    </SidebarProvider>
  )
}
