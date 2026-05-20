import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface NavLink {
  label: string
  href: string
}

interface NavSectionProps {
  logo?: React.ReactNode | string
  links?: NavLink[]
  cta?: { label: string; href?: string }
  variant?: "light" | "dark"
  className?: string
}

function NavSection({
  logo = "Brand",
  links = [],
  cta,
  variant = "light",
  className,
}: NavSectionProps) {
  const isDark = variant === "dark"
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const mobileMenuId = React.useId()

  return (
    <>
      {/* Skip link — first focusable element for keyboard users */}
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:outline-2 focus:outline-offset-2",
          isDark
            ? "focus:bg-[#35BDC8] focus:text-[#090E17] focus:outline-[#35BDC8]"
            : "focus:bg-[#0B6377] focus:text-[#F2F2F2] focus:outline-[#0B6377]"
        )}
      >
        Pular para o conteúdo principal
      </a>
      <header
        className={cn(
          "w-full sticky top-0 z-50 backdrop-blur-md border-b",
          isDark
            ? "bg-black/95 border-[#35BDC8]"
            : "bg-white/95 border-[#0B6377]",
          className
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-6"
          aria-label="Navegação principal"
        >
          {/* Logo */}
          <div className="flex-shrink-0">
            {typeof logo === "string" ? (
              <a
                href="/"
                aria-label={`Ir para home — ${logo}`}
                className={cn(
                  "text-xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm",
                  isDark
                    ? "text-[#DEF7F9] focus-visible:outline-[#35BDC8]"
                    : "text-[#090E17] focus-visible:outline-[#0B6377]"
                )}
                style={{ fontFamily: "var(--heading)" }}
              >
                {logo}
              </a>
            ) : (
              logo
            )}
          </div>

        {/* Center links — hidden on mobile */}
        {links.length > 0 && (
          <ul
            className="hidden md:flex items-center gap-1"
            role="list"
          >
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                    isDark
                      ? "text-[#92DCE2] hover:text-[#DEF7F9] hover:bg-[#1A6872]/30 focus-visible:outline-[#35BDC8]"
                      : "text-[#1A6872] hover:text-[#090E17] hover:bg-[#DEF7F9] focus-visible:outline-[#0B6377]"
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Right: CTA + hamburger */}
        <div className="flex items-center gap-3">
          {cta && (
            <Button
              size="sm"
              className={cn(
                "hidden md:inline-flex px-5 text-sm font-semibold",
                isDark
                  ? "border border-[#35BDC8] text-[#35BDC8] bg-transparent hover:bg-[#35BDC8]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35BDC8]"
                  : "bg-[#0B6377] text-[#F2F2F2] hover:bg-[#1A6872] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6377]"
              )}
              variant={isDark ? "outline" : "default"}
              nativeButton={!cta.href}
              render={cta.href ? <a href={cta.href} /> : undefined}
            >
              {cta.label}
            </Button>
          )}

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              isDark
                ? "text-[#92DCE2] hover:bg-[#1A6872]/30 focus-visible:outline-[#35BDC8]"
                : "text-[#1A6872] hover:bg-[#DEF7F9] focus-visible:outline-[#0B6377]"
            )}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>
      </header>
    </>
  )
}

export { NavSection }
export type { NavSectionProps, NavLink }
