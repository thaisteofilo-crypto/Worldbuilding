import { characters, characterOrder } from "@/lib/characters"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import fs from "fs"
import path from "path"

interface Props {
  params: Promise<{ nome: string }>
}

export async function generateStaticParams() {
  return characterOrder.map((nome) => ({ nome }))
}

function findImage(nome: string, view: string): string | null {
  const extensions = ["jpg", "jpeg", "png", "webp"]
  for (const ext of extensions) {
    const filePath = path.join(process.cwd(), "public", "images", "personagens", `${nome}-${view}.${ext}`)
    if (fs.existsSync(filePath)) return `/images/personagens/${nome}-${view}.${ext}`
  }
  return null
}

export default async function PersonagemPage({ params }: Props) {
  const { nome } = await params
  const char = characters[nome]

  if (!char) notFound()

  const views = [
    { key: "frente", label: "Frente" },
    { key: "perfil", label: "Perfil" },
    { key: "costas", label: "Costas" },
  ]

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <article className="max-w-5xl mx-auto px-8 md:px-16 py-12 pb-20">
        {/* Header */}
        <div className="mb-10">
          <p
            className="text-xs uppercase tracking-[0.2em] font-sans mb-3"
            style={{ color: char.accentColor }}
          >
            Personagem
          </p>
          <h1
            className="font-serif leading-none mb-4"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              color: "var(--foreground)",
            }}
          >
            {char.name}
          </h1>
          <Badge
            className="border-0 text-xs font-sans tracking-[0.1em] uppercase px-2 py-0.5"
            style={{
              backgroundColor: `color-mix(in oklch, ${char.accentColor} 15%, transparent)`,
              color: char.accentColor,
            }}
          >
            {char.role}
          </Badge>
        </div>

        {/* Character design images — large */}
        <div className="space-y-6 mb-12">
          {views.map(({ key, label }) => {
            const imageSrc = findImage(nome, key)
            return (
              <div
                key={key}
                className="relative overflow-hidden rounded-xl"
                style={{
                  aspectRatio: "16/9",
                  backgroundColor: "var(--surface)",
                }}
              >
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={`${char.name} — ${label}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-15"
                      style={{ color: char.accentColor }}
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21,15 16,10 5,21" />
                    </svg>
                    <p
                      className="text-sm font-sans"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {label}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Info grid — glass cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {[
            { label: "Morfologia", value: char.morphology, color: "var(--gold)" },
            { label: "Capacidade", value: char.ability, color: "var(--accent)" },
            { label: "Estado atual", value: char.status, color: "var(--blue-cold)" },
            { label: "Origem", value: char.origin, color: char.accentColor },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="glass-card p-5 rounded-xl"
            >
              <p
                className="text-xs uppercase tracking-[0.15em] font-sans mb-2"
                style={{ color }}
              >
                {label}
              </p>
              <p
                className="font-sans text-sm leading-[1.7]"
                style={{ color: "var(--foreground)" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-4 pt-8">
          <Link
            href={`/contos/${nome}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-sans font-medium transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: char.accentColor,
              color: "var(--primary-foreground)",
            }}
          >
            Ler o conto
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-sans font-medium transition-all duration-200 hover:opacity-80 glass-card"
            style={{ color: "var(--foreground)" }}
          >
            Todos os personagens
          </Link>
        </div>
      </article>
    </ScrollArea>
  )
}
