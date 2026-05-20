import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin } from "lucide-react"

interface ContactChannel {
  type: "email" | "phone" | "address"
  label: string
  value: string
  href?: string
}

interface ContactSectionProps {
  badge?: string
  title: string
  subtitle?: string
  channels?: ContactChannel[]
  ctaLabel?: string
  successMessage?: string
  showSubject?: boolean
  variant?: "light" | "dark"
  className?: string
}

const CHANNEL_ICONS = {
  email: Mail,
  phone: Phone,
  address: MapPin,
}

function ContactSection({
  badge,
  title,
  subtitle,
  channels = [],
  ctaLabel = "Enviar mensagem",
  successMessage = "Mensagem enviada — entraremos em contato em até 1 dia útil.",
  showSubject = true,
  variant = "light",
  className,
}: ContactSectionProps) {
  const isDark = variant === "dark"
  const [submitted, setSubmitted] = React.useState(false)
  const titleId = React.useId()
  const nameId = React.useId()
  const emailId = React.useId()
  const subjectId = React.useId()
  const messageId = React.useId()
  const statusId = React.useId()

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
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-20 items-start">
          {/* Left — heading + channels */}
          <div className="flex flex-col gap-6">
            {badge && (
              <Badge
                variant="outline"
                className={cn(
                  "w-fit text-xs tracking-widest uppercase px-3 font-medium font-mono",
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
                  "text-base md:text-lg leading-relaxed max-w-md",
                  isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                )}
              >
                {subtitle}
              </p>
            )}

            {channels.length > 0 && (
              <ul className="flex flex-col gap-4 mt-4" role="list">
                {channels.map((channel, i) => {
                  const Icon = CHANNEL_ICONS[channel.type]
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          isDark ? "bg-[#0B363C]" : "bg-[#DEF7F9]"
                        )}
                        aria-hidden="true"
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: isDark ? "#35BDC8" : "#0B6377" }}
                        />
                      </div>
                      <div className="flex flex-col gap-0.5 pt-1">
                        <span
                          className={cn(
                            "text-xs font-bold uppercase tracking-widest font-mono",
                            isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                          )}
                        >
                          {channel.label}
                        </span>
                        {channel.href ? (
                          <a
                            href={channel.href}
                            className={cn(
                              "text-sm font-medium transition-colors",
                              isDark
                                ? "text-[#F2F2F2] hover:text-[#35BDC8]"
                                : "text-[#090E17] hover:text-[#0B6377]"
                            )}
                          >
                            {channel.value}
                          </a>
                        ) : (
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                            )}
                          >
                            {channel.value}
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Right — form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
            }}
            className={cn(
              "flex flex-col gap-5 rounded-2xl border p-6 md:p-8",
              isDark
                ? "border-[#1A6872] bg-[#0B363C]"
                : "border-[#0B6377] bg-[#F2F2F2]"
            )}
            aria-describedby={submitted ? statusId : undefined}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={nameId}>Nome</Label>
                <Input
                  id={nameId}
                  type="text"
                  required
                  aria-required="true"
                  disabled={submitted}
                  placeholder="Como devemos te chamar?"
                  autoComplete="name"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={emailId}>E-mail</Label>
                <Input
                  id={emailId}
                  type="email"
                  required
                  aria-required="true"
                  disabled={submitted}
                  placeholder="voce@empresa.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {showSubject && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={subjectId}>Assunto</Label>
                <Input
                  id={subjectId}
                  type="text"
                  disabled={submitted}
                  placeholder="Como podemos ajudar?"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={messageId}>Mensagem</Label>
              <Textarea
                id={messageId}
                required
                aria-required="true"
                disabled={submitted}
                rows={5}
                placeholder="Conte um pouco sobre o que você precisa…"
              />
            </div>

            <Button
              type="submit"
              nativeButton
              disabled={submitted}
              className={cn(
                "h-11 px-6 text-sm font-semibold rounded-lg w-full sm:w-auto sm:self-start",
                isDark
                  ? "bg-[#35BDC8] text-[#090E17] hover:bg-[#2CA0AB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35BDC8]"
                  : "bg-[#0B6377] text-[#F2F2F2] hover:bg-[#1A6872] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6377]"
              )}
            >
              {submitted ? "Enviado" : ctaLabel}
            </Button>

            {submitted && (
              <p
                id={statusId}
                role="status"
                className={cn(
                  "text-sm font-medium",
                  isDark ? "text-[#35BDC8]" : "text-[#0B6377]"
                )}
              >
                {successMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

export { ContactSection }
export type { ContactSectionProps, ContactChannel }
