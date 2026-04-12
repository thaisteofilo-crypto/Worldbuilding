import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { NavSidebar } from "@/components/koru/nav-sidebar"
import { Breadcrumb } from "@/components/koru/breadcrumb"

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:text-sm focus:rounded focus:font-sans"
        style={{ backgroundColor: "var(--accent)", color: "var(--background)" }}
      >
        Pular para conteúdo principal
      </a>
      <NavSidebar />
      <SidebarInset>
        <header
          className="sticky top-0 z-10 flex items-center gap-3 px-4 h-12 border-b"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
          }}
        >
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div
            className="h-4 w-px shrink-0"
            style={{ backgroundColor: "var(--border)" }}
          />
          <Breadcrumb />
        </header>
        <main id="main-content" className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
