import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowRight, X, Sparkles } from "lucide-react"

interface AnnouncementBarSectionProps {
  message: string
  highlight?: string
  link?: { label: string; href: string }
  icon?: React.ElementType
  dismissible?: boolean
  variant?: "light" | "dark" | "brand"
  className?: string
  onDismiss?: () => void
}

function AnnouncementBarSection({
  message,
  highlight,
  link,
  icon: IconProp,
  dismissible = false,
  variant = "brand",
  className,
  onDismiss,
}: AnnouncementBarSectionProps) {
  const [dismissed, setDismissed] = React.useState(false)
  const labelId = React.useId()

  if (dismissed) return null

  const Icon = IconProp ?? Sparkles

  // Brand: Iara solid bg (max contrast for marketing announcement)
  // Light: Orvalho bg with Una text
  // Dark: Ibu bg with light text
  const bg = {
    light: "bg-[#DEF7F9]",
    dark: "bg-[#0B363C]",
    brand: "bg-[#0B6377]",
  }[variant]

  const textColor = {
    light: "#090E17",
    dark: "#DEF7F9",
    brand: "#F2F2F2",
  }[variant]

  const accentColor = {
    light: "#0B6377",
    dark: "#35BDC8",
    brand: "#DEF7F9", // Orvalho — 11.2:1 on #0B6377 (AAA)
  }[variant]

  const dismissHoverBg = {
    light: "hover:bg-[#92DCE2]/60",
    dark: "hover:bg-[#1A6872]/60",
    brand: "hover:bg-white/15",
  }[variant]

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <aside
      role="region"
      aria-labelledby={labelId}
      className={cn("w-full relative", bg, className)}
    >
      <div className="mx-auto max-w-7xl px-6 py-2.5 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2.5 flex-1 justify-center text-center">
          <Icon
            className="h-4 w-4 shrink-0"
            style={{ color: accentColor }}
            aria-hidden="true"
          />
          <p
            id={labelId}
            className="text-sm font-medium leading-snug"
            style={{ color: textColor }}
          >
            {highlight && (
              <>
                <span
                  className="font-bold mr-1.5"
                  style={{ color: accentColor }}
                >
                  {highlight}
                </span>
              </>
            )}
            {message}
            {link && (
              <>
                {" "}
                <a
                  href={link.href}
                  className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 transition-opacity hover:opacity-80"
                  style={{ color: accentColor }}
                >
                  {link.label}
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </a>
              </>
            )}
          </p>
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              "shrink-0 flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              dismissHoverBg
            )}
            style={{ color: textColor, outlineColor: accentColor }}
            aria-label="Fechar anúncio"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </aside>
  )
}

export { AnnouncementBarSection }
export type { AnnouncementBarSectionProps }
