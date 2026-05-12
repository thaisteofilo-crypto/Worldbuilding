export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { getCharactersForViewer } from "@/lib/characters-db"
import { CardCarousel, CAROUSEL_IMAGE_SIZES } from "@/components/koru/card-carousel"
import { getBannerUrls, getCardImages } from "@/lib/banners"
import { getSiteContent, get } from "@/lib/site-content"
import { getBibliaItems, getLivroItems, getContosItems } from "@/lib/content"
import { collectPublishConfigs, isPublic, PublishConfig } from "@/lib/document-publish"

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

// Format ISO date as a short PT-BR label for "scheduled" cards.
function formatReleaseLabel(at: string | null | undefined): string | null {
  if (!at) return null
  const d = new Date(at)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

interface LockedCardOpts {
  releaseAt?: string | null
  kicker?: string
}

function LockedCardOverlay({ releaseAt, kicker }: LockedCardOpts) {
  const release = formatReleaseLabel(releaseAt)
  return (
    <>
      <div className="absolute inset-0" style={{ background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(2px)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 px-4 text-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "oklch(1 0 0 / 0.7)" }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p className="font-sans text-[10px] uppercase tracking-[0.18em]" style={{ color: "oklch(1 0 0 / 0.55)" }}>
          {kicker ?? "Em breve"}
        </p>
        {release && (
          <p className="font-serif text-base" style={{ color: "oklch(1 0 0 / 0.85)", fontFamily: "var(--font-serif), Georgia, serif" }}>
            {release}
          </p>
        )}
      </div>
    </>
  )
}

function JourneyStage({
  number,
  title,
  description,
  startHref,
  startLabel = "Começar",
  isLast = false,
  bannerImage,
  bannerVideo,
  children,
}: {
  number: string
  title: string
  description: string
  startHref: string
  startLabel?: string
  isLast?: boolean
  bannerImage?: string
  bannerVideo?: string
  children: React.ReactNode
}) {
  const hasBanner = !!(bannerImage || bannerVideo)
  return (
    <section className="relative px-4 md:px-16 py-14 md:py-20">
      {/* Subtle banner anchored behind the number — blurred, low-opacity, contained */}
      {hasBanner && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-0 md:left-4 hidden md:block"
          style={{
            width: "22rem",
            height: "22rem",
            opacity: 0.22,
            filter: "blur(14px)",
            maskImage: "radial-gradient(circle at center, oklch(0 0 0) 0%, oklch(0 0 0 / 0.6) 45%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle at center, oklch(0 0 0) 0%, oklch(0 0 0 / 0.6) 45%, transparent 75%)",
            zIndex: 0,
          }}
        >
          {bannerVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover rounded-full"
              src={bannerVideo}
              poster={bannerImage}
            />
          ) : bannerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover rounded-full"
            />
          ) : null}
        </div>
      )}

      <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10" style={{ zIndex: 1 }}>
        {/* Number column with vertical connector */}
        <div className="relative flex md:flex-col items-start md:items-center md:pt-2">
          <span
            className="font-serif leading-none select-none"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "clamp(3.5rem, 8vw, 6rem)",
              color: "var(--foreground)",
              opacity: 0.18,
            }}
          >
            {number}
          </span>
          {!isLast && (
            <div
              aria-hidden="true"
              className="hidden md:block mt-6 w-px flex-1 self-stretch"
              style={{ backgroundColor: "var(--border)", minHeight: "4rem" }}
            />
          )}
        </div>

        {/* Content column */}
        <div className="min-w-0">
          <h2
            className="font-serif text-3xl md:text-4xl leading-tight mb-3"
            style={{ fontFamily: "var(--font-serif), Georgia, serif", color: "var(--foreground)" }}
          >
            {title}
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mb-8 leading-relaxed font-sans">
            {description}
          </p>
          <div className="mb-6">{children}</div>
          <Link
            href={startHref}
            className="inline-flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
          >
            {startLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Mobile connector below stage */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="md:hidden mx-auto mt-10 w-px h-12"
          style={{ backgroundColor: "var(--border)" }}
        />
      )}
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

  const publishConfigs = collectPublishConfigs(siteContent)
  const now = new Date()
  const cfgFor = (path: string): PublishConfig =>
    publishConfigs.get(path) ?? { state: "published", at: null }
  const visible = (path: string) => isPublic(cfgFor(path), now)

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

  // Journey CTA targets — pick the first publicly available entry per section, with sensible fallbacks.
  const firstBibliaPath = finalBibliaDocs.find((d) => visible(d.path)) ?? finalBibliaDocs[0]
  const firstBibliaSlug = firstBibliaPath ? pathFilename(firstBibliaPath.path) : "parte-00-manifesto"
  const bibliaHref = `/biblia/${firstBibliaSlug}`

  const firstContoKey = characterOrder.find(
    (k) => contosAvailable.has(k) && !excluded.has(`contos/conto-${k}.md`) && visible(`contos/conto-${k}.md`),
  )
  const contosHref = firstContoKey ? `/contos/${firstContoKey}` : "/contos/amara"

  const firstLivroDoc = finalLivroDocs.find((d) => visible(d.path)) ?? finalLivroDocs[0]
  const firstLivroSlug = firstLivroDoc ? livroUrlSlug(pathFilename(firstLivroDoc.path)) : "01"
  const livroHref = `/livro/${firstLivroSlug}`

  const personagensHref = "/personagens"

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

      {/* CTA principal — convite à jornada */}
      <section className="px-4 md:px-16 pt-12 md:pt-16 pb-4 md:pb-6">
        <div className="flex flex-col items-start gap-3 max-w-2xl">
          <Link
            href={bibliaHref}
            className="inline-flex items-center justify-center rounded-full px-7 py-3.5 font-sans text-base transition-colors"
            style={{ backgroundColor: "var(--foreground)", color: "var(--background)" }}
          >
            Começar pela bíblia
          </Link>
          <p className="text-sm font-sans text-muted-foreground">
            Quatro caminhos, um mundo. Comece pelo que sustenta o resto.
          </p>
        </div>
      </section>

      {/* Jornada vertical — 4 etapas numeradas */}
      <JourneyStage
        number="01"
        title={get(siteContent, "section.biblia.label", "Entender o mundo")}
        description={get(siteContent, "section.biblia.description", "A bíblia é a fundação. Aqui o mundo se explica por dentro: a física da memória, os ciclos de luz, as criaturas que habitam o Akwu. Comece por aqui se quiser saber em que terreno está pisando.")}
        startHref={bibliaHref}
        startLabel="Começar pela bíblia"
        bannerImage={banners.biblia}
        bannerVideo={banners["biblia-video"]}
      >
        <CardCarousel>
          {finalBibliaDocs.map((doc) => {
            const filename = pathFilename(doc.path)
            const cardKey = `biblia-${filename}`
            const title = get(siteContent, `biblia.${filename}.title`) || doc.label
            const cfg = cfgFor(doc.path)
            const open = isPublic(cfg, now)
            const cardInner = (
              <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                {cardImages[cardKey] ? (
                  <Image src={cardImages[cardKey]} alt={title} fill sizes={CAROUSEL_IMAGE_SIZES} loading="lazy" className="object-cover koru-card-img" />
                ) : (
                  <ImagePlaceholder />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)" }} />
                {!open && <LockedCardOverlay releaseAt={cfg.at} />}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20">
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
            )
            if (!open) {
              return (
                <div key={doc.path} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative" aria-disabled="true" style={{ cursor: "default" }}>
                  {cardInner}
                </div>
              )
            }
            return (
              <Link key={doc.path} href={`/biblia/${filename}`} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative">
                {cardInner}
              </Link>
            )
          })}
        </CardCarousel>
      </JourneyStage>

      <JourneyStage
        number="02"
        title={get(siteContent, "section.personagens.label", "Conhecer quem habita")}
        description={get(siteContent, "section.personagens.description", "Os personagens são as ressonâncias do mundo. Amara, Oruku, Temiku, Beku: cada um carrega uma frequência, uma falha, um eco. Conheça-os antes de entrar nas histórias.")}
        startHref={personagensHref}
        startLabel="Conhecer os personagens"
        bannerImage={banners.personagens}
        bannerVideo={banners["personagens-video"]}
      >
        <CardCarousel>
          {characterOrder.map((key) => {
            const char = characters[key]
            const docPath = `personagens/${key}`
            const cfg = cfgFor(docPath)
            const open = isPublic(cfg, now)
            const cardInner = (
              <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                {cardImages[`char-${key}`] ? (
                  <Image src={cardImages[`char-${key}`]} alt={char.name} fill sizes={CAROUSEL_IMAGE_SIZES} loading="lazy" className="object-cover koru-card-img" />
                ) : (
                  <ImagePlaceholder />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)" }} />
                {!open && <LockedCardOverlay releaseAt={cfg.at} />}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20">
                  <p className="font-serif text-lg md:text-2xl leading-tight text-white" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{char.name}</p>
                  <p className="text-sm md:text-base font-sans text-white/70 mt-1">{char.role.split(",")[0].trim()}</p>
                </div>
              </div>
            )
            if (!open) {
              return (
                <div key={key} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative" aria-disabled="true" style={{ cursor: "default" }}>
                  {cardInner}
                </div>
              )
            }
            return (
              <Link key={key} href={`/personagens/${key}`} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative">
                {cardInner}
              </Link>
            )
          })}
        </CardCarousel>
      </JourneyStage>

      <JourneyStage
        number="03"
        title={get(siteContent, "section.contos.label", "Ler as histórias")}
        description={get(siteContent, "section.contos.description", "Cada conto é um corte rente: uma cena, uma decisão, uma perda. Pequenos textos literários que mostram o mundo por dentro de quem o vive. Comece por Amara e siga na ordem, ou escolha o nome que te chamar.")}
        startHref={contosHref}
        startLabel="Ler os contos"
        bannerImage={banners.contos}
        bannerVideo={banners["contos-video"]}
      >
        <CardCarousel>
          {characterOrder.filter((key) => contosAvailable.has(key) && !excluded.has(`contos/conto-${key}.md`)).map((key) => {
            const char = characters[key]
            const docPath = `contos/conto-${key}.md`
            const cfg = cfgFor(docPath)
            const open = isPublic(cfg, now)
            const cardInner = (
              <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                {cardImages[`conto-${key}`] ? (
                  <Image src={cardImages[`conto-${key}`]} alt={char.name} fill sizes={CAROUSEL_IMAGE_SIZES} loading="lazy" className="object-cover koru-card-img" />
                ) : (
                  <ImagePlaceholder />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)" }} />
                {!open && <LockedCardOverlay releaseAt={cfg.at} />}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20">
                  <p className="text-xs md:text-base font-sans text-white/60">Conto</p>
                  <p className="font-serif text-lg md:text-2xl font-medium leading-tight text-white mt-1" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{char.name}</p>
                </div>
              </div>
            )
            if (!open) {
              return (
                <div key={key} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative" aria-disabled="true" style={{ cursor: "default" }}>
                  {cardInner}
                </div>
              )
            }
            return (
              <Link key={key} href={`/contos/${key}`} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative">
                {cardInner}
              </Link>
            )
          })}
        </CardCarousel>
      </JourneyStage>

      <JourneyStage
        number="04"
        title={get(siteContent, "section.livro.label", "Mergulhar no livro")}
        description={get(siteContent, "section.livro.description", "A história de Temiku, em capítulos. O fio longo do mundo, do início ao fim, sem atalho. Leia depois dos contos, ou antes, se preferir o caminho largo primeiro.")}
        startHref={livroHref}
        startLabel="Mergulhar no livro"
        isLast
        bannerImage={banners.livro}
        bannerVideo={banners["livro-video"]}
      >
        <CardCarousel>
          {finalLivroDocs.map((doc) => {
            const filename = pathFilename(doc.path)
            const urlSlug = livroUrlSlug(filename)
            const cardKey = livroCardKey(filename)
            const title = get(siteContent, `livro.${urlSlug}.title`) || doc.label
            const cfg = cfgFor(doc.path)
            const open = isPublic(cfg, now)
            const cardInner = (
              <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}>
                {cardImages[cardKey] ? (
                  <Image src={cardImages[cardKey]} alt={title} fill sizes={CAROUSEL_IMAGE_SIZES} loading="lazy" className="object-cover koru-card-img" />
                ) : (
                  <ImagePlaceholder />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)" }} />
                {!open && <LockedCardOverlay releaseAt={cfg.at} />}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20">
                  <p className="text-xs md:text-base font-sans text-white/60">{urlSlug === 'epilogo' ? 'Fim' : `Cap. ${urlSlug}`}</p>
                  <p className="font-serif text-lg md:text-2xl font-medium leading-tight text-white mt-1" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{title}</p>
                </div>
              </div>
            )
            if (!open) {
              return (
                <div key={doc.path} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative" aria-disabled="true" style={{ cursor: "default" }}>
                  {cardInner}
                </div>
              )
            }
            return (
              <Link key={doc.path} href={`/livro/${urlSlug}`} className="carousel-card koru-card group shrink-0 block rounded-xl overflow-hidden relative">
                {cardInner}
              </Link>
            )
          })}
        </CardCarousel>
      </JourneyStage>

      {/* Nota de fechamento da jornada */}
      <section className="px-4 md:px-16 py-12 md:py-16">
        <p className="text-center text-sm font-sans text-muted-foreground italic max-w-xl mx-auto">
          Você não precisa ler na ordem. Mas pode.
        </p>
      </section>

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
