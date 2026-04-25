export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { getCharactersForViewer } from "@/lib/characters-db"
import { ThemeToggle } from "@/components/koru/theme-toggle"
import { CardCarousel } from "@/components/koru/card-carousel"
import { getBannerUrls, getCardImages } from "@/lib/banners"
import { getSiteContent, get } from "@/lib/site-content"
import { getBibliaItems, getLivroItems, getContosItems } from "@/lib/content"

interface DocEntry { label: string; path: string }

// Extract last filename without extension: "livro/capitulo-07.md" -> "capitulo-07"
function pathFilename(path: string): string {
  return path.replace(/\.md$/, '').split('/').pop() ?? ''
}

// URL slug for livro: "capitulo-01" -> "01", "epilogo" -> "epilogo"
function livroUrlSlug(filename: string): string {
  return filename.replace(/^capitulo-/, '')
}

// Card image key for livro entries
function livroCardKey(filename: string): string {
  return `livro-${livroUrlSlug(filename)}`
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
      <Image src={url} alt="" fill className="object-cover" priority={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.7) 0%, oklch(0 0 0 / 0.3) 50%, oklch(0 0 0 / 0.15) 100%)" }} />
    </>
  )
}

function FullSection({
  label,
  title,
  bannerUrl,
  videoUrl,
  children,
}: {
  label: string
  title: string
  bannerUrl?: string
  videoUrl?: string
  children: React.ReactNode
}) {
  const hasBanner = !!(videoUrl || bannerUrl)
  return (
    <section className="relative flex flex-col justify-center overflow-hidden py-10 md:py-16 px-4 md:px-16">
      {videoUrl ? (
        <>
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" src={videoUrl} poster={bannerUrl} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.7) 0%, oklch(0 0 0 / 0.3) 50%, oklch(0 0 0 / 0.15) 100%)" }} />
        </>
      ) : hasBanner ? (
        <SectionBanner url={bannerUrl!} />
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
  const [banners, cardImages, siteContent, { chars: characters, order: characterOrder }] = await Promise.all([
    getBannerUrls(),
    getCardImages(),
    getSiteContent(),
    getCharactersForViewer(),
  ])

  // Excluded paths — docs the user explicitly removed from the editor
  let excluded = new Set<string>()
  try {
    const excludedRaw = siteContent['editor.excluded_paths']
    if (excludedRaw) excluded = new Set<string>(JSON.parse(excludedRaw))
  } catch { /* ignore */ }

  // Primary: filesystem scan — auto-discovers files that exist on disk.
  // Editor-supplied titles in site_content override the filesystem default when present.
  const filesystemBiblia: DocEntry[] = getBibliaItems()
    .map((item) => {
      const override = siteContent[`biblia.${item.slug}.title`]
      return { label: (override ?? item.title), path: `biblia/${item.slug}.md` }
    })
    .filter((d) => !excluded.has(d.path))
  const filesystemLivro: DocEntry[] = getLivroItems()
    .map((item) => {
      const key = item.slug === 'epilogo' ? 'livro.epilogo.title' : `livro.${item.slug}.title`
      const override = siteContent[key]
      return {
        label: (override ?? item.title),
        path: item.slug === 'epilogo' ? 'livro/epilogo.md' : `livro/capitulo-${item.slug}.md`,
      }
    })
    .filter((d) => !excluded.has(d.path))
  const contosAvailable = new Set(getContosItems().map((i) => i.slug))

  // Merge with editor.doc_groups — label overrides + docs added before file exists on disk
  let finalBibliaDocs = filesystemBiblia
  let finalLivroDocs = filesystemLivro

  const docGroupsRaw = siteContent['editor.doc_groups']
  if (docGroupsRaw) {
    try {
      const groups = JSON.parse(docGroupsRaw) as Array<{ section: string; docs: DocEntry[] }>

      const editorBiblia = groups.find((g) => g.section === 'Bíblia')?.docs ?? []
      const editorLivro = groups.find((g) => g.section === 'Livro')?.docs ?? []

      const bibliaLabels = new Map(editorBiblia.map((d) => [d.path, d.label]))
      const livroLabels = new Map(editorLivro.map((d) => [d.path, d.label]))

      const fsBibliaPaths = new Set(filesystemBiblia.map((d) => d.path))
      const fsLivroPaths = new Set(filesystemLivro.map((d) => d.path))

      // Editor labels (with "Kicker · Título" format) take precedence on the home cards,
      // so simplifying biblia.parte-XX.title in site_content doesn't strip the kicker.
      finalBibliaDocs = filesystemBiblia.map((d) => ({ ...d, label: bibliaLabels.get(d.path) ?? d.label }))
      finalLivroDocs = filesystemLivro.map((d) => ({ ...d, label: livroLabels.get(d.path) ?? d.label }))

      const extraBiblia = editorBiblia.filter((d) => !fsBibliaPaths.has(d.path) && !excluded.has(d.path))
      const extraLivro = editorLivro.filter((d) => !fsLivroPaths.has(d.path) && !excluded.has(d.path))

      if (extraBiblia.length) finalBibliaDocs = [...finalBibliaDocs, ...extraBiblia]
      if (extraLivro.length) finalLivroDocs = [...finalLivroDocs, ...extraLivro]
    } catch { /* ignore */ }
  }

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
            <Image src={banners.hero} alt="Korú" fill className="object-cover" priority />
            <div className="absolute inset-0" style={{ background: "oklch(0 0 0 / 0.4)" }} />
          </>
        ) : (
          <div className="absolute inset-0 bg-background" />
        )}
        <div className="relative z-10 px-4 sm:px-8 md:px-16">
          <h1
            className="koru-hero-text font-serif leading-[0.85] mb-8"
            style={{
              fontSize: "clamp(6rem, 18vw, 14rem)",
              color: hasHero ? "white" : "var(--foreground)",
              fontFamily: "var(--font-serif), Georgia, serif",
              textShadow: "none",
            }}
          >
            Korú
          </h1>
          <p
            className="koru-content-enter text-lg md:text-2xl leading-relaxed max-w-xl font-sans"
            style={{
              color: hasHero ? "oklch(1 0 0 / 0.9)" : "var(--muted-foreground)",
              textShadow: hasHero ? "0 1px 8px oklch(0 0 0 / 0.5)" : undefined,
              animationDelay: "0.55s",
            }}
          >
            {get(siteContent, "hero.tagline")}
          </p>
        </div>
      </section>

      {/* Bíblia */}
      <FullSection label={get(siteContent, "section.biblia.label")} title={get(siteContent, "section.biblia.title")} bannerUrl={banners.biblia} videoUrl={banners["biblia-video"]}>
        <CardCarousel>
          {finalBibliaDocs.map((doc) => {
            const filename = pathFilename(doc.path)
            const cardKey = `biblia-${filename}`
            const title = get(siteContent, `biblia.${filename}.title`) || doc.label
            return (
              <Link key={doc.path} href={`/biblia/${filename}`} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative">
                <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                  {cardImages[cardKey] ? (
                    <Image src={cardImages[cardKey]} alt={title} fill className="object-cover koru-card-img" />
                  ) : (
                    <ImagePlaceholder />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                    {doc.label.includes(" · ") ? (
                      <>
                        <p className="text-xs md:text-sm font-sans text-white/50">{doc.label.split(" · ")[0]}</p>
                        <p className="font-serif text-lg md:text-2xl font-medium leading-tight text-white mt-1" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{doc.label.split(" · ")[1]}</p>
                      </>
                    ) : (
                      <p className="font-serif text-lg md:text-2xl font-medium leading-tight text-white" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{title}</p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </CardCarousel>
      </FullSection>

      {/* Personagens */}
      <FullSection label={get(siteContent, "section.personagens.label")} title={get(siteContent, "section.personagens.title")} bannerUrl={banners.personagens} videoUrl={banners["personagens-video"]}>
        <CardCarousel>
          {characterOrder.map((key) => {
            const char = characters[key]
            return (
              <Link key={key} href={`/personagens/${key}`} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative">
                <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                  {cardImages[`char-${key}`] ? (
                    <Image src={cardImages[`char-${key}`]} alt={char.name} fill className="object-cover koru-card-img" />
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

      {/* Contos */}
      <FullSection label={get(siteContent, "section.contos.label")} title={get(siteContent, "section.contos.title")} bannerUrl={banners.contos} videoUrl={banners["contos-video"]}>
        <CardCarousel>
          {characterOrder.filter((key) => contosAvailable.has(key) && !excluded.has(`contos/conto-${key}.md`)).map((key) => {
            const char = characters[key]
            return (
              <Link key={key} href={`/contos/${key}`} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative">
                <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                  {cardImages[`conto-${key}`] ? (
                    <Image src={cardImages[`conto-${key}`]} alt={char.name} fill className="object-cover koru-card-img" />
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

      {/* Livro */}
      <FullSection label={get(siteContent, "section.livro.label")} title={get(siteContent, "section.livro.title")} bannerUrl={banners.livro} videoUrl={banners["livro-video"]}>
        <CardCarousel>
          {finalLivroDocs.map((doc) => {
            const filename = pathFilename(doc.path)
            const urlSlug = livroUrlSlug(filename)
            const cardKey = livroCardKey(filename)
            const title = get(siteContent, `livro.${urlSlug}.title`) || doc.label
            return (
              <Link key={doc.path} href={`/livro/${urlSlug}`} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative">
                <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                  {cardImages[cardKey] ? (
                    <Image src={cardImages[cardKey]} alt={title} fill className="object-cover koru-card-img" />
                  ) : (
                    <ImagePlaceholder />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                    <p className="text-xs md:text-base font-sans text-white/60">{urlSlug === 'epilogo' ? 'Fim' : `Cap. ${urlSlug}`}</p>
                    <p className="font-serif text-lg md:text-2xl font-medium leading-tight text-white mt-1" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{title}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </CardCarousel>
      </FullSection>

      {/* Banner Final — Vídeo */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {banners["footer-video"] ? (
          <>
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" src={banners["footer-video"]} poster={banners.footer} />
            <div className="absolute inset-0" style={{ background: "oklch(0 0 0 / 0.4)" }} />
          </>
        ) : banners.footer ? (
          <>
            <Image src={banners.footer} alt="" fill className="object-cover" />
            <div className="absolute inset-0" style={{ background: "oklch(0 0 0 / 0.4)" }} />
          </>
        ) : (
          <div className="absolute inset-0 bg-background" />
        )}
        <p
          className="absolute bottom-6 left-0 right-0 text-center font-serif text-base z-10"
          style={{ color: "oklch(1 0 0 / 0.3)", fontFamily: "var(--font-serif), Georgia, serif", letterSpacing: "0.08em" }}
        >
          {get(siteContent, "footer.copyright")}
        </p>
      </section>
    </div>
  )
}
