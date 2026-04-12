import { characters, characterOrder } from "@/lib/characters"
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

  const infoCards = [
    { label: "Especie", value: char.species },
    { label: "Morfologia", value: char.morphology },
    { label: "Capacidade", value: char.ability },
    { label: "Estado atual", value: char.status },
    { label: "Origem", value: char.origin },
    { label: "Marca (Isilo-Ori)", value: char.mark },
  ]

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <article className="pb-20" role="article" aria-label={`Perfil de ${char.name}`}>
        {/* Header */}
        <div className="max-w-5xl mx-auto px-8 md:px-16 pt-10">
          <h1
            className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1]"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              color: "var(--foreground)",
            }}
          >
            {char.name}
          </h1>
        </div>

        {/* Images — full width, 3 columns */}
        <div className="w-full mt-10">
          <div className="grid grid-cols-3 gap-0">
            {views.map(({ key, label }) => {
              const imageSrc = findImage(nome, key)
              return (
                <div
                  key={key}
                  className="relative overflow-hidden"
                  style={{
                    aspectRatio: "2/3",
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
                        style={{ color: "var(--foreground)" }}
                        aria-hidden="true"
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
        </div>

        {/* Character sheet */}
        <div className="max-w-5xl mx-auto px-8 md:px-16 mt-12">
          {/* About */}
          <section className="mb-10" aria-label="Sobre">
            <p
              className="font-sans text-base leading-[1.8] max-w-3xl"
              style={{ color: "var(--foreground)" }}
            >
              {char.description}
            </p>
          </section>

          {/* Info grid */}
          <section className="mb-10" aria-label="Detalhes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {infoCards.map(({ label, value }) => (
                <div key={label} className="glass-card p-5 rounded-xl">
                  <p
                    className="text-xs uppercase tracking-[0.15em] font-sans mb-2"
                    style={{ color: "var(--muted-foreground)" }}
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
          </section>

          {/* Relations */}
          {char.relations.length > 0 && (
            <section className="mb-10" aria-label="Conexoes">
              <div className="flex flex-wrap gap-4">
                {char.relations.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/personagens/${rel.slug}`}
                    className="glass-card rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] block min-w-[220px]"
                    aria-label={`Ver perfil de ${rel.name}`}
                  >
                    <p
                      className="font-serif text-lg mb-1"
                      style={{ color: "var(--foreground)" }}
                    >
                      {rel.name}
                    </p>
                    <p
                      className="font-sans text-xs leading-relaxed"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {rel.type}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Navigation buttons */}
          <div className="flex flex-wrap gap-4 pt-8">
            <Link
              href={`/contos/${nome}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-sans font-medium transition-all duration-200 hover:opacity-90"
              style={{
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
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
        </div>
      </article>
    </ScrollArea>
  )
}
