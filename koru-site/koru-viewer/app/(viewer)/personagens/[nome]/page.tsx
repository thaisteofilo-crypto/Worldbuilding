import { getCharactersForViewer } from "@/lib/characters-db"
import { characterOrder } from "@/lib/characters"
import { contoSlugs } from "@/lib/content"
import { getSiteContent } from "@/lib/site-content"
import { getPublishConfig, isPublic } from "@/lib/document-publish"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import fs from "fs"
import path from "path"
import { CharacterGallery } from "@/components/koru/character-gallery"

interface Props {
  params: Promise<{ nome: string }>
}

// Force-dynamic: o conteúdo do personagem (campos como `mark`/Características,
// status, descrição) vem do Supabase e o admin edita ao vivo. SSG estava
// servindo "not found" cacheado quando o Supabase falhava no build. Com
// dynamic garantimos consistência com o admin sem depender de revalidate.
export const dynamic = "force-dynamic"

export async function generateStaticParams() {
  // characterOrder é a fonte canônica em código; o Supabase pode adicionar
  // novos slugs em runtime e o fallback dynamic params trata isso.
  return characterOrder.map((nome) => ({ nome }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nome } = await params
  const { chars } = await getCharactersForViewer()
  const char = chars[nome]
  const displayName = char?.name ?? nome.charAt(0).toUpperCase() + nome.slice(1)
  const title = `${displayName} · Personagens · Korú`
  const description =
    char?.description?.slice(0, 160) ??
    `Perfil de ${displayName}, ser do Akwu, no universo de Korú.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "pt_BR",
    },
  }
}

function findImage(nome: string, view: string): string | null {
  const extensions = ["jpg", "jpeg", "png", "webp"]
  for (const ext of extensions) {
    const filePath = path.join(
      process.cwd(),
      "public",
      "images",
      "personagens",
      `${nome}-${view}.${ext}`
    )
    if (fs.existsSync(filePath)) return `/images/personagens/${nome}-${view}.${ext}`
  }
  return null
}

// ── Status badge helpers ─────────────────────────────────────────────────────

type StatusTone = "ativo" | "dissolvido" | "preso" | "outro"

function resolveStatusTone(status: string): StatusTone {
  const s = status.toLowerCase()
  if (s.includes("dissolvid") || s.includes("dissolved")) return "dissolvido"
  if (
    s.includes("pres") ||
    s.includes("anomalia") ||
    s.includes("preso") ||
    s.includes("presa")
  )
    return "preso"
  if (
    s.includes("ativo") ||
    s.includes("existindo") ||
    s.includes("presente") ||
    s.includes("vivo")
  )
    return "ativo"
  return "outro"
}

const STATUS_STYLES: Record<
  StatusTone,
  { bg: string; color: string; border: string }
> = {
  ativo: {
    bg: "oklch(0.25 0.08 145 / 0.25)",
    color: "oklch(0.72 0.14 145)",
    border: "oklch(0.72 0.14 145 / 0.35)",
  },
  dissolvido: {
    bg: "oklch(0.22 0.07 220 / 0.25)",
    color: "var(--blue-cold)",
    border: "oklch(0.62 0.09 220 / 0.35)",
  },
  preso: {
    bg: "oklch(0.30 0.10 75 / 0.25)",
    color: "var(--gold)",
    border: "oklch(0.72 0.10 75 / 0.35)",
  },
  outro: {
    bg: "oklch(0 0 0 / 0.12)",
    color: "var(--muted-foreground)",
    border: "oklch(0 0 0 / 0.18)",
  },
}

// ── Relation badge helpers ───────────────────────────────────────────────────

function resolveRelationStyle(type: string): { color: string; bg: string } {
  const t = type.toLowerCase()
  if (
    t.includes("origem") ||
    t.includes("gerou") ||
    t.includes("dissolução")
  ) {
    return {
      color: "var(--blue-cold)",
      bg: "oklch(0.22 0.07 220 / 0.20)",
    }
  }
  if (
    t.includes("frequência") ||
    t.includes("frequencia") ||
    t.includes("limiar")
  ) {
    return {
      color: "var(--accent)",
      bg: "oklch(0.25 0.06 290 / 0.20)",
    }
  }
  if (t.includes("vínculo") || t.includes("vinculo")) {
    return {
      color: "var(--gold)",
      bg: "oklch(0.30 0.08 75 / 0.20)",
    }
  }
  return {
    color: "var(--muted-foreground)",
    bg: "oklch(0 0 0 / 0.10)",
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default async function PersonagemPage({ params }: Props) {
  const { nome } = await params
  const { chars } = await getCharactersForViewer()
  const char = chars[nome]

  if (!char) notFound()

  const siteContent = await getSiteContent()
  if (!isPublic(getPublishConfig(siteContent, `personagens/${nome}`))) notFound()

  const hasConto = contoSlugs().some((s) => s.personagem === nome)

  const galleryViews = [
    { key: "frente", label: "Frente", src: findImage(nome, "frente") },
    { key: "perfil", label: "Perfil", src: findImage(nome, "perfil") },
    { key: "costas", label: "Costas", src: findImage(nome, "costas") },
  ]

  const infoCards = [
    { label: "Especie", value: char.species },
    { label: "Morfologia", value: char.morphology },
    { label: "Capacidade", value: char.ability },
    { label: "Origem", value: char.origin },
    { label: "Sinal", value: char.mark },
  ].filter(({ value }) => value && value.trim() !== "" && value !== "A definir")

  const statusTone = char.status ? resolveStatusTone(char.status) : null
  const statusStyle = statusTone ? STATUS_STYLES[statusTone] : null

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <article className="pb-20" role="article" aria-label={`Perfil de ${char.name}`}>
        {/* ── Hero Gallery ── */}
        <div className="px-4 md:px-8 pt-6">
        <CharacterGallery
          name={char.name}
          views={galleryViews}
          overlay={
            <div
              className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 md:px-16 pb-6 sm:pb-8 pt-16 sm:pt-24"
              style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.75) 0%, transparent 100%)" }}
            >
              <h1
                className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.0]"
                style={{ color: "white", textShadow: "0 2px 24px oklch(0 0 0 / 0.5)" }}
              >
                {char.name}
              </h1>
            </div>
          }
        />
        </div>

        {/* ── Character sheet ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 md:px-16 mt-8 sm:mt-12">
          {/* Description */}
          <section className="mb-10" aria-label="Sobre">
            <p
              className="font-sans text-base leading-[1.8] max-w-3xl"
              style={{ color: "var(--foreground)" }}
            >
              {char.description}
            </p>
            {hasConto && (
              <Link
                href={`/contos/${nome}`}
                className="inline-flex items-center gap-1 mt-4 font-sans text-xs transition-opacity duration-150 hover:opacity-70"
                style={{ color: "var(--accent)" }}
              >
                Ler o conto de {char.name}
              </Link>
            )}
          </section>

          {/* Info grid */}
          {infoCards.length > 0 && (
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
          )}

          {/* ── Conexoes ── */}
          {char.relations.length > 0 && (
            <section className="mb-10" aria-label="Conexoes">
              <div className="mb-5">
                <p
                  className="font-sans text-xs uppercase tracking-[0.2em] mb-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Mundo
                </p>
                <h2
                  className="font-serif text-2xl"
                  style={{ color: "var(--foreground)" }}
                >
                  Conexoes
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {char.relations.map((rel) => {
                  const relStyle = resolveRelationStyle(rel.type)
                  const initial = rel.name.charAt(0).toUpperCase()
                  const relImageSrc = findImage(rel.slug, "frente")

                  return (
                    <Link
                      key={rel.slug}
                      href={`/personagens/${rel.slug}`}
                      className="group flex items-center gap-4 glass-card rounded-xl p-4 transition-all duration-200 hover:scale-[1.01]"
                      style={{}}
                      aria-label={`Ver perfil de ${rel.name}`}
                    >
                      {/* Avatar */}
                      <div
                        className="relative overflow-hidden rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{
                          width: 48,
                          height: 48,
                          backgroundColor: "var(--surface)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {relImageSrc ? (
                          <Image
                            src={relImageSrc}
                            alt={rel.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span
                            className="font-serif text-lg leading-none select-none"
                            style={{ color: "var(--accent)" }}
                            aria-hidden="true"
                          >
                            {initial}
                          </span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-serif text-base leading-tight mb-1 group-hover:opacity-80 transition-opacity"
                          style={{ color: "var(--foreground)" }}
                        >
                          {rel.name}
                        </p>
                        <span
                          className="font-sans text-xs inline-block px-2 py-0.5 rounded-full"
                          style={{
                            color: relStyle.color,
                            backgroundColor: relStyle.bg,
                          }}
                        >
                          {rel.type.split(":")[0]}
                        </span>
                      </div>

                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Navigation buttons */}
          <div className="flex flex-wrap gap-4 pt-8">
            {hasConto && (
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
            )}
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
