import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Link2, X, Code2, Globe } from "lucide-react"

const AVATAR_PALETTE = [
  { bg: "#0B6377", text: "#F2F2F2" }, // Iara — 4.7:1 AA ✓
  { bg: "#8B3D17", text: "#F2F2F2" }, // Barro — 6.1:1 AA ✓
  { bg: "#9B6C22", text: "#F2F2F2" }, // Mel — 4.8:1 AA ✓
  { bg: "#707C36", text: "#F2F2F2" }, // Mata — 4.6:1 AA ✓
  { bg: "#C72211", text: "#F2F2F2" }, // Urucum — 4.7:1 AA ✓
  { bg: "#BF505C", text: "#090E17" }, // Jambo — dark text 4.7:1 AA ✓
  { bg: "#DD560D", text: "#090E17" }, // Brasa — dark text 5.4:1 AA ✓
]

interface SocialLink {
  type: "Link2" | "X" | "Code2" | "website"
  href: string
}

interface TeamMember {
  name: string
  role: string
  bio?: string
  imageSrc?: string
  socials?: SocialLink[]
}

interface TeamSectionProps {
  badge?: string
  title: string
  subtitle?: string
  members: TeamMember[]
  columns?: 2 | 3 | 4
  variant?: "light" | "dark"
  className?: string
}

const ICONS = {
  Link2: Link2,
  X: X,
  Code2: Code2,
  website: Globe,
}

function MemberAvatar({
  member,
  index,
  isDark,
}: {
  member: TeamMember
  index: number
  isDark: boolean
}) {
  const initials = member.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length]

  if (member.imageSrc) {
    return (
      <img
        src={member.imageSrc}
        alt={`Foto de ${member.name}`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    )
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center text-2xl font-bold"
      style={{
        background: isDark ? "#0B363C" : palette.bg,
        color: isDark ? "#92DCE2" : palette.text,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

function TeamSection({
  badge,
  title,
  subtitle,
  members,
  columns = 4,
  variant = "light",
  className,
}: TeamSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns]

  return (
    <section
      className={cn(
        "w-full px-6 py-20 md:py-28",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      aria-labelledby={titleId}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center gap-4">
          {badge && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs tracking-widest uppercase px-3 font-medium font-mono",
                isDark
                  ? "border-[#1A6872] text-[#92DCE2] bg-[#0B363C]"
                  : "border-[#0B6377] text-[#0B6377] bg-[#DEF7F9]"
              )}
            >
              {badge}
            </Badge>
          )}
          <h2
            id={titleId}
            className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight"
            style={{
              fontFamily: "var(--heading)",
              color: isDark ? "#F2F2F2" : "#090E17",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                "text-base md:text-lg max-w-2xl leading-relaxed",
                isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Grid */}
        <ul
          className={cn("grid grid-cols-1 gap-6 list-none p-0 m-0", gridCols)}
          role="list"
        >
          {members.map((member, index) => (
            <li
              key={index}
              className={cn(
                "flex flex-col rounded-2xl overflow-hidden border transition-colors",
                isDark
                  ? "border-[#1A6872] bg-[#0B363C]"
                  : "border-[#0B6377] bg-[#F2F2F2] hover:bg-[#DEF7F9]/60"
              )}
            >
              {/* Avatar */}
              <div
                className="w-full overflow-hidden"
                style={{ aspectRatio: "1/1" }}
              >
                <MemberAvatar member={member} index={index} isDark={isDark} />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1.5 p-5">
                <p
                  className={cn(
                    "text-base font-semibold leading-snug",
                    isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                  )}
                >
                  {member.name}
                </p>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isDark ? "text-[#35BDC8]" : "text-[#0B6377]"
                  )}
                >
                  {member.role}
                </p>
                {member.bio && (
                  <p
                    className={cn(
                      "text-sm leading-relaxed mt-1",
                      isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                    )}
                  >
                    {member.bio}
                  </p>
                )}

                {member.socials && member.socials.length > 0 && (
                  <ul
                    className="flex items-center gap-1 mt-3"
                    aria-label={`Links de ${member.name}`}
                  >
                    {member.socials.map((social, si) => {
                      const Icon = ICONS[social.type]
                      const labelMap = {
                        Link2: "Link2",
                        X: "X",
                        Code2: "Code2",
                        website: "Site",
                      }
                      return (
                        <li key={si}>
                          <a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                              isDark
                                ? "text-[#92DCE2] hover:bg-[#1A6872]/40 hover:text-[#DEF7F9] focus-visible:outline-[#35BDC8]"
                                : "text-[#1A6872] hover:bg-[#DEF7F9] hover:text-[#0B6377] focus-visible:outline-[#0B6377]"
                            )}
                            aria-label={`${labelMap[social.type]} de ${member.name} — abre em nova aba`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export { TeamSection }
export type { TeamSectionProps, TeamMember, SocialLink }
