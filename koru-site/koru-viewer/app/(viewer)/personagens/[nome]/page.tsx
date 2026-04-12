import { characters, characterOrder } from "@/lib/characters"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Props {
  params: Promise<{ nome: string }>
}

export async function generateStaticParams() {
  return characterOrder.map((nome) => ({ nome }))
}

export default async function PersonagemPage({ params }: Props) {
  const { nome } = await params
  const char = characters[nome]

  if (!char) notFound()

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      {/* Full-width hero section */}
      <div
        className="relative w-full flex items-end pb-12 px-8 md:px-16 overflow-hidden"
        style={{
          minHeight: "70vh",
          background: char.gradient,
        }}
      >
        {/* Organic silhouette */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 200 280"
            className="h-full max-h-[80%] opacity-10"
            style={{ fill: char.accentColor }}
          >
            <ellipse cx="100" cy="110" rx="44" ry="36" />
            <ellipse cx="100" cy="180" rx="56" ry="70" />
            <ellipse cx="70" cy="230" rx="20" ry="36" />
            <ellipse cx="130" cy="230" rx="20" ry="36" />
            <ellipse cx="60" cy="150" rx="16" ry="56" />
            <ellipse cx="140" cy="150" rx="16" ry="56" />
            <ellipse cx="84" cy="84" rx="10" ry="36"
              style={{ transform: "rotate(-15deg)", transformOrigin: "84px 84px" }} />
            <ellipse cx="116" cy="84" rx="10" ry="36"
              style={{ transform: "rotate(15deg)", transformOrigin: "116px 84px" }} />
          </svg>
        </div>

        {/* Gradient overlay bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, oklch(0.07 0.008 280 / 0.9), transparent)",
          }}
        />

        {/* Character name */}
        <div className="relative z-10">
          <Badge
            className="mb-4 border-0 text-xs font-sans tracking-[0.1em] uppercase"
            style={{
              backgroundColor: `color-mix(in oklch, ${char.accentColor} 20%, transparent)`,
              color: char.accentColor,
            }}
          >
            {char.role}
          </Badge>
          <h1
            className="leading-none"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "clamp(4rem, 10vw, 8rem)",
              color: "var(--foreground)",
            }}
          >
            {char.name}
          </h1>
        </div>
      </div>

      {/* Info grid */}
      <div className="max-w-4xl mx-auto px-8 md:px-16 py-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { label: "Morfologia", value: char.morphology, color: "var(--gold)" },
            { label: "Capacidade", value: char.ability, color: "var(--accent)" },
            { label: "Estado atual", value: char.status, color: "var(--blue-cold)" },
            { label: "Origem", value: char.origin, color: char.accentColor },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="p-5 rounded-sm border"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
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
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/contos/${nome}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-sans font-medium transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: char.accentColor,
              color: "var(--background)",
            }}
          >
            Ler o conto
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-sans font-medium border transition-all duration-200 hover:border-accent"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            Todos os personagens
          </Link>
        </div>
      </div>
    </ScrollArea>
  )
}
