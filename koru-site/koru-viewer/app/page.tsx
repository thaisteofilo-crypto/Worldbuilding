import Link from "next/link"
import Image from "next/image"
import { characters, characterOrder } from "@/lib/characters"
import { ThemeToggle } from "@/components/koru/theme-toggle"
import { CardCarousel } from "@/components/koru/card-carousel"
import { getBannerUrls, getCharacterImageUrls, getCardImages } from "@/lib/banners"

const bibliaParts = [
  { parte: "00", title: "Introdução" },
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

const references = [
  { title: "Planeta dos Abutres", author: "Joseph Bennett & Charles Huettner", year: "2023" },
  { title: "Harry Potter", author: "J.K. Rowling", year: "1997–2007" },
  { title: "A Mão Esquerda da Escuridão", author: "Ursula K. Le Guin", year: "1969" },
  { title: "Os Despossuídos", author: "Ursula K. Le Guin", year: "1974" },
  { title: "As Crônicas de Nárnia", author: "C.S. Lewis", year: "1950–1956" },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

function ImagePlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="opacity-15" style={{ color: "var(--muted-foreground)" }}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    </div>
  )
}

function SectionBanner({ url }: { url?: string }) {
  if (!url) return null

  const isVideo = url.includes("hero-video") || url.endsWith(".mp4") || url.endsWith(".webm")

  if (isVideo) {
    return (
      <>
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={url}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.7) 0%, oklch(0 0 0 / 0.3) 50%, oklch(0 0 0 / 0.15) 100%)" }} />
      </>
    )
  }

  return (
    <>
      <Image src={url} alt="" fill className="object-cover" priority={false} unoptimized />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.7) 0%, oklch(0 0 0 / 0.3) 50%, oklch(0 0 0 / 0.15) 100%)" }} />
    </>
  )
}

function FullSection({
  label,
  title,
  bannerUrl,
  children,
}: {
  label: string
  title: string
  bannerUrl?: string
  children: React.ReactNode
}) {
  const hasBanner = !!bannerUrl
  return (
    <section className="relative flex flex-col justify-center overflow-hidden py-10 md:py-16 px-4 md:px-16">
      {hasBanner ? (
        <SectionBanner url={bannerUrl} />
      ) : (
        <div className="absolute inset-0 bg-background" />
      )}
      <div className="relative z-10">
        <p
          className="text-xs uppercase tracking-[0.25em] mb-3 font-sans"
          style={{
            color: hasBanner ? "oklch(1 0 0 / 0.85)" : "var(--muted-foreground)",
            textShadow: hasBanner ? "0 1px 4px oklch(0 0 0 / 0.5)" : undefined,
          }}
        >
          {label}
        </p>
        <h2
          className="font-serif text-3xl md:text-5xl leading-none mb-6 md:mb-8"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            color: hasBanner ? "white" : "var(--foreground)",
            textShadow: hasBanner ? "0 2px 12px oklch(0 0 0 / 0.4)" : undefined,
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  )
}

export default async function HomePage() {
  const [banners, characterImages, cardImages] = await Promise.all([
    getBannerUrls(),
    getCharacterImageUrls(),
    getCardImages(),
  ])

  const hasHero = !!(banners.hero || banners["hero-video"])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-4 right-6 z-50 flex items-center gap-1">
        <Link
          href="/admin/login"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-muted opacity-30 hover:opacity-60"
          aria-label="Admin"
          title="Admin"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
        <ThemeToggle />
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {banners["hero-video"] ? (
          <>
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" src={banners["hero-video"]} poster={banners.hero} />
            <div className="absolute inset-0" style={{ background: "oklch(0 0 0 / 0.4)" }} />
          </>
        ) : banners.hero ? (
          <>
            <Image src={banners.hero} alt="Korú" fill className="object-cover" priority unoptimized />
            <div className="absolute inset-0" style={{ background: "oklch(0 0 0 / 0.4)" }} />
          </>
        ) : (
          <div className="absolute inset-0 bg-background" />
        )}
        <div className="relative z-10 px-8 md:px-16">
          <h1
            className="font-serif leading-[0.85] mb-8"
            style={{
              fontSize: "clamp(6rem, 18vw, 14rem)",
              color: hasHero ? "white" : "var(--foreground)",
              fontFamily: "var(--font-serif), Georgia, serif",
              textShadow: hasHero ? "0 2px 16px oklch(0 0 0 / 0.4)" : undefined,
            }}
          >
            Korú
          </h1>
          <p
            className="text-lg md:text-2xl leading-relaxed max-w-xl font-sans"
            style={{
              color: hasHero ? "oklch(1 0 0 / 0.9)" : "var(--muted-foreground)",
              textShadow: hasHero ? "0 1px 8px oklch(0 0 0 / 0.5)" : undefined,
            }}
          >
            Um mundo cuja física é baseada em memória.
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/biblia/parte-00"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-sans font-medium transition-all duration-200 hover:opacity-90"
              style={{
                backgroundColor: hasHero ? "oklch(1 0 0 / 0.15)" : "var(--foreground)",
                color: hasHero ? "white" : "var(--background)",
                border: hasHero ? "1px solid oklch(1 0 0 / 0.3)" : "none",
                backdropFilter: hasHero ? "blur(16px)" : undefined,
              }}
            >
              Bíblia do Mundo
            </Link>
            <Link
              href="/livro/01"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-sans font-medium transition-all duration-200 hover:opacity-90"
              style={{
                backgroundColor: hasHero ? "oklch(1 0 0 / 0.15)" : "transparent",
                color: hasHero ? "white" : "var(--foreground)",
                border: hasHero ? "1px solid oklch(1 0 0 / 0.3)" : "1px solid var(--border)",
                backdropFilter: hasHero ? "blur(16px)" : undefined,
              }}
            >
              O Livro
            </Link>
          </div>
        </div>
      </section>

      {/* Personagens */}
      <FullSection label="Personagens" title="Os seres do Akwu" bannerUrl={banners.personagens}>
        <CardCarousel>
          {characterOrder.map((key) => {
            const char = characters[key]
            return (
              <Link key={key} href={`/personagens/${key}`} className="carousel-card group shrink-0 block rounded-xl transition-all duration-300 hover:scale-[1.03] overflow-hidden relative">
                <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                  {characterImages[key] ? (
                    <Image src={characterImages[key]} alt={char.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                  ) : (
                    <ImagePlaceholder />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                    <p className="font-serif text-lg md:text-2xl leading-tight text-white" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{char.name}</p>
                    <p className="text-sm md:text-base font-sans text-white/70 mt-1">{char.role.split(",")[0].trim()}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </CardCarousel>
      </FullSection>

      {/* Bíblia */}
      <FullSection label="Bíblia do Mundo" title="O arquivo vivo" bannerUrl={banners.biblia}>
        <CardCarousel>
          {bibliaParts.map((part) => (
            <Link key={part.parte} href={`/biblia/parte-${part.parte}`} className="carousel-card group shrink-0 block rounded-xl transition-all duration-300 hover:scale-[1.03] overflow-hidden relative">
              <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                {cardImages[`biblia-parte-${part.parte}`] ? (
                  <Image src={cardImages[`biblia-parte-${part.parte}`]} alt={part.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                ) : (
                  <ImagePlaceholder />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                  <p className="text-xs md:text-base font-sans text-white/60">Parte {part.parte}</p>
                  <p className="font-serif text-lg md:text-2xl font-medium leading-tight text-white mt-1" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{part.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </CardCarousel>
      </FullSection>

      {/* Livro */}
      <FullSection label="Livro" title="O Peso da Luz" bannerUrl={banners.livro}>
        <CardCarousel>
          {livroChapters.map((ch) => (
            <Link key={ch.slug} href={`/livro/${ch.slug}`} className="carousel-card group shrink-0 block rounded-xl transition-all duration-300 hover:scale-[1.03] overflow-hidden relative">
              <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                {cardImages[`livro-${ch.slug}`] ? (
                  <Image src={cardImages[`livro-${ch.slug}`]} alt={ch.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                ) : (
                  <ImagePlaceholder />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                  <p className="text-xs md:text-base font-sans text-white/60">{ch.slug === "epilogo" ? "Fim" : `Cap. ${ch.slug}`}</p>
                  <p className="font-serif text-lg md:text-2xl font-medium leading-tight text-white mt-1" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{ch.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </CardCarousel>
      </FullSection>

      {/* Contos */}
      <FullSection label="Contos" title="Vozes do Akwu" bannerUrl={banners.contos}>
        <CardCarousel>
          {characterOrder.map((key) => {
            const char = characters[key]
            return (
              <Link key={key} href={`/contos/${key}`} className="carousel-card group shrink-0 block rounded-xl transition-all duration-300 hover:scale-[1.03] overflow-hidden relative">
                <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                  {characterImages[key] ? (
                    <Image src={characterImages[key]} alt={char.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                  ) : (
                    <ImagePlaceholder />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                    <p className="text-xs md:text-base font-sans text-white/60">Conto</p>
                    <p className="font-serif text-lg md:text-2xl font-medium leading-tight text-white mt-1" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{char.name}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </CardCarousel>
      </FullSection>

      {/* Referências */}
      <FullSection label="Referências" title="Mundos que alimentam Korú" bannerUrl={banners.referencias}>
        <CardCarousel>
          {references.map((ref) => (
            <div key={ref.title} className="carousel-card group shrink-0 block rounded-xl transition-all duration-300 hover:scale-[1.03] overflow-hidden relative">
              <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                {cardImages[`ref-${slugify(ref.title)}`] ? (
                  <Image src={cardImages[`ref-${slugify(ref.title)}`]} alt={ref.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                ) : (
                  <ImagePlaceholder />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.7) 0%, oklch(0 0 0 / 0.3) 40%, transparent 70%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                  <p className="font-serif text-xl font-medium leading-tight text-white mb-1" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{ref.title}</p>
                  <p className="text-sm font-sans text-white/60">{ref.author} · {ref.year}</p>
                </div>
              </div>
            </div>
          ))}
        </CardCarousel>
      </FullSection>
    </div>
  )
}
