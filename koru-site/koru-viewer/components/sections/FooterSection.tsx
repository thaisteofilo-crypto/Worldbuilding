import * as React from "react"
import { cn } from "@/lib/utils"

interface FooterLink {
  label: string
  href: string
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

interface FooterSectionProps {
  logo?: React.ReactNode
  logoText?: string
  tagline?: string
  columns?: FooterColumn[]
  bottomLinks?: FooterLink[]
  copyright?: string
  variant?: "light" | "dark"
  className?: string
}

function FooterSection({
  logo,
  logoText,
  tagline,
  columns = [],
  bottomLinks = [],
  copyright,
  variant = "light",
  className,
}: FooterSectionProps) {
  const isDark = variant === "dark"

  const accentColor = isDark ? "#35BDC8" : "#0B6377"
  const textColor = isDark ? "#F2F2F2" : "#090E17"
  const mutedColor = isDark ? "#92DCE2" : "#114F56"
  const borderColor = isDark ? "#35BDC8" : "#0B6377"
  const hoverStyle = { color: accentColor }

  return (
    <footer
      className={cn(
        "w-full",
        isDark ? "bg-black" : "bg-white",
        className
      )}
    >
      {/* Main footer body */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: logo + tagline */}
          <div className="flex flex-col gap-4">
            {(logo || logoText) && (
              <div className="flex items-center gap-2">
                {logo && <span>{logo}</span>}
                {logoText && (
                  <span
                    className="text-lg font-semibold tracking-tight"
                    style={{ color: textColor, fontFamily: "var(--heading)" }}
                  >
                    {logoText}
                  </span>
                )}
              </div>
            )}
            {tagline && (
              <p
                className="text-sm leading-relaxed max-w-[220px]"
                style={{ color: mutedColor }}
              >
                {tagline}
              </p>
            )}
          </div>

          {/* Link columns */}
          {columns.slice(0, 3).map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-4">
              <p
                className="text-xs font-bold uppercase tracking-widest font-mono"
                style={{ color: textColor }}
                aria-hidden="true"
              >
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-150 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ color: mutedColor }}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLAnchorElement).style.color =
                          accentColor
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLAnchorElement).style.color =
                          mutedColor
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t"
        style={{ borderColor }}
      >
        {copyright && (
          <small className="text-xs order-2 sm:order-1 not-italic" style={{ color: mutedColor }}>
            {copyright}
          </small>
        )}

        {bottomLinks.length > 0 && (
          <nav
            aria-label="Links do rodapé"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 order-1 sm:order-2"
          >
            {bottomLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs transition-colors duration-150 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: mutedColor }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color =
                    accentColor
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.color =
                    mutedColor
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </footer>
  )
}

export { FooterSection }
export type { FooterSectionProps, FooterColumn, FooterLink }
