import Link from "next/link"
import { characters, characterOrder } from "@/lib/characters"
import { Badge } from "@/components/ui/badge"

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 5.5 + 3) % 100}%`,
  top: `${(i * 7.3 + 10) % 90}%`,
  size: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5,
  delay: `${(i * 0.7) % 6}s`,
  duration: `${6 + (i % 4) * 2}s`,
}))

const ambientes = [
  {
    name: "Akwu",
    description: "O mundo interior. Luz dourada do teto.",
    gradient:
      "linear-gradient(180deg, oklch(0.18 0.08 75) 0%, oklch(0.12 0.04 75) 40%, oklch(0.08 0.008 280) 100%)",
    accentColor: "var(--gold)",
  },
  {
    name: "Bomi Veh",
    description: "Campo de memória fosforescente. Eco lilás.",
    gradient:
      "linear-gradient(135deg, oklch(0.10 0.008 280) 0%, oklch(0.18 0.06 290) 50%, oklch(0.10 0.008 280) 100%)",
    accentColor: "var(--accent)",
  },
  {
    name: "Ariku",
    description: "Filtros laterais de luz. Redistribuição.",
    gradient:
      "linear-gradient(135deg, oklch(0.10 0.008 280) 0%, oklch(0.16 0.07 220) 50%, oklch(0.10 0.008 280) 100%)",
    accentColor: "var(--blue-cold)",
  },
]

const bibliaParts = [
  { parte: "00", title: "Manifesto" },
  { parte: "01", title: "Física e Cosmologia" },
  { parte: "02", title: "Geografia" },
  { parte: "03", title: "Ecossistema" },
  { parte: "04", title: "Criaturas" },
  { parte: "05", title: "Personagens" },
  { parte: "06", title: "Regras" },
  { parte: "07", title: "Cultura" },
  { parte: "08", title: "Linha do Tempo" },
]

const livroChapters = [
  { slug: "01", title: "Capítulo 1" },
  { slug: "02", title: "Capítulo 2" },
  { slug: "03", title: "Capítulo 3" },
  { slug: "04", title: "Capítulo 4" },
  { slug: "05", title: "Capítulo 5" },
  { slug: "06", title: "Capítulo 6" },
  { slug: "epilogo", title: "Epílogo" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section
        className="relative min-h-screen flex flex-col justify-center items-start px-8 md:px-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.07 0.008 280), oklch(0.12 0.015 290), oklch(0.07 0.008 270))",
        }}
      >
        {/* Floating particles */}
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle absolute rounded-full pointer-events-none"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: "var(--accent)",
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}

        <div className="relative z-10 max-w-3xl">
          <p
            className="text-sm uppercase tracking-[0.25em] mb-6 font-sans"
            style={{ color: "var(--accent)" }}
          >
            Brand System Viewer
          </p>
          <h1
            className="font-serif leading-none mb-6"
            style={{
              fontSize: "clamp(5rem, 14vw, 9rem)",
              color: "var(--foreground)",
              fontFamily: "var(--font-serif), Georgia, serif",
            }}
          >
            Korú
          </h1>
          <p
            className="text-xl md:text-2xl leading-relaxed max-w-xl font-sans"
            style={{ color: "var(--muted-foreground)" }}
          >
            Um mundo cuja física é baseada em memória.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/biblia/parte-00"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-sans font-medium transition-all duration-200 hover:opacity-90"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--primary-foreground)",
              }}
            >
              Bíblia do Mundo
            </Link>
            <Link
              href="/livro/01"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-sans font-medium border transition-all duration-200 hover:border-accent"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              O Livro
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, var(--background), transparent)",
          }}
        />
      </section>

      {/* Personagens */}
      <section className="py-20 px-8 md:px-16">
        <div className="mb-12">
          <p
            className="text-xs uppercase tracking-[0.25em] mb-3 font-sans"
            style={{ color: "var(--gold)" }}
          >
            Personagens
          </p>
          <h2
            className="font-serif text-5xl md:text-6xl leading-none"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              color: "var(--foreground)",
            }}
          >
            Os seres do Akwu
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {characterOrder.map((key) => {
            const char = characters[key]
            return (
              <Link
                key={key}
                href={`/personagens/${key}`}
                className="group relative block overflow-hidden rounded-sm border transition-all duration-300 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderColor: "var(--border)",
                  aspectRatio: "2/3",
                  minWidth: "150px",
                }}
              >
                {/* Gradient background */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{ background: char.gradient }}
                />

                {/* Organic silhouette shape */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 100 140"
                    className="w-3/4 h-3/4 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                    style={{ fill: char.accentColor }}
                  >
                    <ellipse cx="50" cy="55" rx="22" ry="18" />
                    <ellipse cx="50" cy="90" rx="28" ry="35" />
                    <ellipse cx="35" cy="115" rx="10" ry="18" />
                    <ellipse cx="65" cy="115" rx="10" ry="18" />
                    <ellipse cx="30" cy="75" rx="8" ry="28" />
                    <ellipse cx="70" cy="75" rx="8" ry="28" />
                    <ellipse cx="42" cy="42" rx="5" ry="18" style={{ transform: "rotate(-15deg)", transformOrigin: "42px 42px" }} />
                    <ellipse cx="58" cy="42" rx="5" ry="18" style={{ transform: "rotate(15deg)", transformOrigin: "58px 42px" }} />
                  </svg>
                </div>

                {/* Hover glow border */}
                <div
                  className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${char.accentColor}`,
                  }}
                />

                {/* Bottom info overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-3"
                  style={{
                    background:
                      "linear-gradient(to top, oklch(0.05 0.008 280 / 0.95), transparent)",
                  }}
                >
                  <p
                    className="font-serif text-lg leading-tight mb-1"
                    style={{
                      fontFamily: "var(--font-serif), Georgia, serif",
                      color: "var(--foreground)",
                    }}
                  >
                    {char.name}
                  </p>
                  <Badge
                    className="text-xs px-1.5 py-0 border-0 font-sans font-normal"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${char.accentColor} 20%, transparent)`,
                      color: char.accentColor,
                    }}
                  >
                    {char.role.split("—")[0].trim()}
                  </Badge>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Ambientes */}
      <section className="py-20 px-8 md:px-16">
        <div className="mb-12">
          <p
            className="text-xs uppercase tracking-[0.25em] mb-3 font-sans"
            style={{ color: "var(--accent)" }}
          >
            Ambientes
          </p>
          <h2
            className="font-serif text-5xl md:text-6xl leading-none"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              color: "var(--foreground)",
            }}
          >
            O Akwu e seus campos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ambientes.map((amb) => (
            <div
              key={amb.name}
              className="relative overflow-hidden rounded-sm border"
              style={{
                aspectRatio: "16/9",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="absolute inset-0"
                style={{ background: amb.gradient }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p
                  className="font-serif text-3xl md:text-4xl leading-none mb-2"
                  style={{
                    fontFamily: "var(--font-serif), Georgia, serif",
                    color: "var(--foreground)",
                  }}
                >
                  {amb.name}
                </p>
                <p
                  className="text-xs font-sans text-center max-w-[200px]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {amb.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Documentos */}
      <section className="py-20 px-8 md:px-16 pb-32">
        <div className="mb-12">
          <p
            className="text-xs uppercase tracking-[0.25em] mb-3 font-sans"
            style={{ color: "var(--blue-cold)" }}
          >
            Documentos
          </p>
          <h2
            className="font-serif text-5xl md:text-6xl leading-none"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              color: "var(--foreground)",
            }}
          >
            O arquivo vivo
          </h2>
        </div>

        {/* Biblia */}
        <div className="mb-10">
          <p
            className="text-xs uppercase tracking-[0.15em] mb-4 font-sans"
            style={{ color: "var(--gold)" }}
          >
            Bíblia — {bibliaParts.length} partes
          </p>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
            {bibliaParts.map((part) => (
              <Link
                key={part.parte}
                href={`/biblia/parte-${part.parte}`}
                className="flex-shrink-0 group flex flex-col justify-between p-4 rounded-sm border transition-all duration-200 hover:border-gold w-44 h-28"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <span
                  className="text-xs font-sans"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Parte {part.parte}
                </span>
                <span
                  className="font-serif text-sm leading-tight group-hover:text-gold transition-colors"
                  style={{
                    fontFamily: "var(--font-serif), Georgia, serif",
                    color: "var(--foreground)",
                  }}
                >
                  {part.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Livro */}
        <div className="mb-10">
          <p
            className="text-xs uppercase tracking-[0.15em] mb-4 font-sans"
            style={{ color: "var(--accent)" }}
          >
            Livro — {livroChapters.length} capítulos
          </p>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {livroChapters.map((ch) => (
              <Link
                key={ch.slug}
                href={`/livro/${ch.slug}`}
                className="flex-shrink-0 group flex flex-col justify-between p-4 rounded-sm border transition-all duration-200 hover:border-accent w-36 h-28"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <span
                  className="text-xs font-sans"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {ch.slug === "epilogo" ? "Fim" : `Cap. ${ch.slug}`}
                </span>
                <span
                  className="font-serif text-sm leading-tight group-hover:text-accent transition-colors"
                  style={{
                    fontFamily: "var(--font-serif), Georgia, serif",
                    color: "var(--foreground)",
                  }}
                >
                  {ch.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Contos */}
        <div>
          <p
            className="text-xs uppercase tracking-[0.15em] mb-4 font-sans"
            style={{ color: "var(--blue-cold)" }}
          >
            Contos — 7 personagens
          </p>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {characterOrder.map((key) => {
              const char = characters[key]
              return (
                <Link
                  key={key}
                  href={`/contos/${key}`}
                  className="flex-shrink-0 group flex flex-col justify-between p-4 rounded-sm border transition-all duration-200 w-40 h-28"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface)",
                  }}
                >
                  <span
                    className="text-xs font-sans"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Conto
                  </span>
                  <span
                    className="font-serif text-sm leading-tight"
                    style={{
                      fontFamily: "var(--font-serif), Georgia, serif",
                      color: "var(--foreground)",
                    }}
                  >
                    {char.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
