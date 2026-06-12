export const revalidate = 30

import Link from "next/link"
import Image from "next/image"
import { getCharactersForViewer } from "@/lib/characters-db"
import { HomeNav } from "@/components/koru/home-nav"
import { CardCarousel } from "@/components/koru/card-carousel"
import { ContinueReadingCard } from "@/components/koru/continue-reading-card"
import { getBannerUrls, getCardImages } from "@/lib/banners"
import { getSiteContent, get } from "@/lib/site-content"
import { getBibliaItems, getLivroItems, getContosItems } from "@/lib/content"
import { collectPublishConfigs, isPublic, PublishConfig } from "@/lib/document-publish"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

interface DocEntry { label: string; path: string }

// Cores sólidas da marca Korú
const BRAND: string[] = ["#E99000", "#C72211", "#DD560D", "#BF505C", "#707C36", "#9B6C22", "#8B3D17"]

const BIBLIA_COLORS: Record<string, string> = {
  "manifesto":            "#E99000",
  "parte-00-manifesto":   "#E99000",
  "parte-00":             "#9B6C22",
  "parte-01":             "#707C36",
  "parte-02":             "#8B3D17",
  "parte-03":             "#707C36",
  "parte-04":             "#C72211",
  "parte-05":             "#BF505C",
  "parte-06":             "#9B6C22",
  "parte-07":             "#E99000",
  "parte-08":             "#8B3D17",
  "glossario-de-koru":    "#DD560D",
  "glossario-de-lugares": "#707C36",
}
function bibliaColor(slug: string): string {
  return BIBLIA_COLORS[slug] ?? "#9B6C22"
}

const CHAR_COLORS: Record<string, string> = {
  temiku: "#BF505C",
  amara:  "#707C36",
  oruku:  "#9B6C22",
  beku:   "#8B3D17",
  obaru:  "#C72211",
  kemdi:  "#DD560D",
  temi:   "#E99000",
  orike:  "#707C36",
  kairo:  "#BF505C",
}
function charColor(slug: string): string {
  return CHAR_COLORS[slug] ?? BRAND[0]
}

const LIVRO_COLORS: Record<string, string> = {
  "01": "#C72211", "02": "#DD560D", "03": "#BF505C", "04": "#707C36",
  "05": "#9B6C22", "06": "#8B3D17", "07": "#E99000", "08": "#C72211",
  "09": "#DD560D", "10": "#BF505C", "11": "#707C36", "12": "#9B6C22",
  epilogo: "#E99000",
}
function livroColor(slug: string): string {
  return LIVRO_COLORS[slug] ?? "#9B6C22"
}

// Extract last filename without extension: "livro/capitulo-07.md" -> "capitulo-07"
function pathFilename(path: string): string {
  return path.replace(/\.md$/, '').split('/').pop() ?? ''
}

// URL slug for livro: "capitulo-01" -> "01", "epilogo" -> "epilogo"
function livroUrlSlug(filename: string): string {
  return filename.replace(/^capitulo-/, '')
}


function ImagePlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="opacity-15" style={{ color: "hsl(var(--muted-foreground))" }}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    </div>
  )
}

// Visual padrão de TODOS os cards do Livro (01–12 e Epílogo):
// a cor sólida da marca (livroColor, no card) fica visível sob um scrim
// suave + número do capítulo em serifa, garantindo uniformidade no carrossel.
function LivroCardPlaceholder({ slug }: { slug: string }) {
  const isEpilogo = slug === "epilogo"
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(130% 100% at 80% 0%, oklch(0 0 0 / 0) 0%, oklch(0 0 0 / 0.22) 55%, oklch(0 0 0 / 0.45) 100%)",
      }}
    >
      <div className="absolute inset-3 rounded-lg pointer-events-none" style={{ border: "1px solid oklch(1 0 0 / 0.08)" }} />
      <span
        className="font-serif select-none leading-none"
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: isEpilogo ? "2.25rem" : "5rem",
          fontStyle: isEpilogo ? "italic" : "normal",
          letterSpacing: isEpilogo ? "0.06em" : "0.02em",
          color: "oklch(1 0 0 / 0.22)",
        }}
      >
        {isEpilogo ? "fim" : slug}
      </span>
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
        <Lock size={22} style={{ color: "oklch(1 0 0 / 0.7)" }} />
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
  id,
  label,
  title,
  description,
  bannerUrl,
  videoUrl,
  children,
}: {
  id?: string
  label?: string
  title: string
  description?: string
  bannerUrl?: string
  videoUrl?: string
  children: React.ReactNode
}) {
  const hasBanner = !!(videoUrl || bannerUrl)
  return (
    <section id={id} className="relative flex flex-col justify-center overflow-hidden min-h-[100svh] py-20 md:py-24 px-4 md:px-16 scroll-mt-16">
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
        {label && (
          <p
            className="font-sans text-xs tracking-[0.2em] uppercase mb-3"
            style={{
              color: hasBanner ? "oklch(1 0 0 / 0.6)" : "hsl(var(--muted-foreground))",
              textShadow: hasBanner ? "0 1px 6px oklch(0 0 0 / 0.45)" : undefined,
            }}
          >
            {label}
          </p>
        )}
        <h2
          className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mb-4 md:mb-6"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            color: hasBanner ? "white" : "hsl(var(--foreground))",
            textShadow: hasBanner ? "0 2px 12px oklch(0 0 0 / 0.4)" : undefined,
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="font-sans text-lg md:text-xl leading-relaxed max-w-2xl mb-8 md:mb-10"
            style={{
              color: hasBanner ? "oklch(1 0 0 / 0.85)" : "hsl(var(--muted-foreground))",
              textShadow: hasBanner ? "0 1px 6px oklch(0 0 0 / 0.45)" : undefined,
            }}
          >
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}

export const metadata = {
  title: "Korú — Um mundo cuja física é baseada em memória",
  description: "A física, a cosmologia, as criaturas e os acordos que sustentam o Akwu.",
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

      // Editor labels (with "Kicker · Título" format) are the fallback for the home cards;
      // títulos cadastrados no CMS (site_content / admin → Conteúdo) têm prioridade na renderização.
      finalBibliaDocs = filesystemBiblia.map((d) => ({ ...d, label: bibliaLabels.get(d.path) ?? d.label }))
      finalLivroDocs = filesystemLivro.map((d) => ({ ...d, label: livroLabels.get(d.path) ?? d.label }))

      const extraBiblia = editorBiblia.filter((d) => !fsBibliaPaths.has(d.path) && !excluded.has(d.path))
      const extraLivro = editorLivro.filter((d) => !fsLivroPaths.has(d.path) && !excluded.has(d.path))

      if (extraBiblia.length) finalBibliaDocs = [...finalBibliaDocs, ...extraBiblia]
      if (extraLivro.length) finalLivroDocs = [...finalLivroDocs, ...extraLivro]
    } catch { /* ignore */ }
  }

  const hasHero = !!(banners.hero || banners["hero-video"])

  // Hero CTA target — first publicly available bíblia entry, with sensible fallback.
  const firstBibliaPath = finalBibliaDocs.find((d) => visible(d.path)) ?? finalBibliaDocs[0]
  const firstBibliaSlug = firstBibliaPath ? pathFilename(firstBibliaPath.path) : "parte-00-manifesto"
  const bibliaHref = `/biblia/${firstBibliaSlug}`

  // Hero CTAs — texto e link vêm do CMS (admin → Conteúdo); hardcoded é só fallback.
  const ctaPrimaryText = get(siteContent, "hero.cta_primary_text") || "Começar pela bíblia"
  const ctaPrimaryHref = get(siteContent, "hero.cta_primary_href") || bibliaHref
  const ctaSecondaryText = get(siteContent, "hero.cta_secondary_text")
  const ctaSecondaryHref = get(siteContent, "hero.cta_secondary_href")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HomeNav />

      {/* Hero */}
      <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
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
              color: hasHero ? "white" : "hsl(var(--foreground))",
              fontFamily: "var(--font-serif), Georgia, serif",
              textShadow: "none",
            }}
          >
            Korú
          </h1>
          <p
            className="koru-content-enter text-lg md:text-2xl leading-relaxed max-w-xl font-sans mb-8"
            style={{
              color: hasHero ? "oklch(1 0 0 / 0.9)" : "hsl(var(--muted-foreground))",
              textShadow: hasHero ? "0 1px 8px oklch(0 0 0 / 0.5)" : undefined,
              animationDelay: "0.55s",
            }}
          >
            {get(siteContent, "hero.tagline")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="default"
              asChild
              className="koru-content-enter border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-md dark:border-white/30 dark:text-white dark:bg-white/10 dark:hover:bg-white/20"
              style={{ animationDelay: "0.7s" }}
            >
              <Link href={ctaPrimaryHref}>
                {ctaPrimaryText}
              </Link>
            </Button>
            {ctaSecondaryText && ctaSecondaryHref && (
              <Button
                variant="outline"
                size="default"
                asChild
                className="koru-content-enter border-white/15 text-white/85 bg-transparent hover:bg-white/10 hover:text-white backdrop-blur-md dark:border-white/15 dark:text-white/85 dark:bg-transparent dark:hover:bg-white/10"
                style={{ animationDelay: "0.8s" }}
              >
                <Link href={ctaSecondaryHref}>
                  {ctaSecondaryText}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Continuar lendo — só aparece se houver último documento lido (localStorage) */}
      <ContinueReadingCard />

      {/* Bíblia */}
      <FullSection id="biblia" label={get(siteContent, "section.biblia.label")} title={get(siteContent, "section.biblia.title")} description={get(siteContent, "section.biblia.description")} bannerUrl={banners.biblia} videoUrl={banners["biblia-video"]}>
        <CardCarousel>
          {finalBibliaDocs.map((doc) => {
            const filename = pathFilename(doc.path)
            const cardKey = `biblia-${filename}`
            const title = get(siteContent, `biblia.${filename}.title`) || doc.label
            const cfg = cfgFor(doc.path)
            const open = isPublic(cfg, now)
            const cardInner = (
              <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: bibliaColor(filename), width: "clamp(140px, 20vw, 260px)" }}>
                {cardImages[cardKey] ? (
                  <Image src={cardImages[cardKey]} alt={title} fill sizes="(max-width: 768px) 140px, (max-width: 1280px) 200px, 260px" className="object-cover koru-card-img" />
                ) : (
                  <ImagePlaceholder />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)" }} />
                {!open && <LockedCardOverlay releaseAt={cfg.at} />}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20">
                  {/* Título do card: CMS (site_content) primeiro; label do editor é só fallback */}
                  {title.includes(" · ") ? (
                    <>
                      <p className="text-xs md:text-sm font-sans text-white/50">{title.split(" · ")[0]}</p>
                      <p className="font-serif text-lg md:text-2xl font-medium leading-tight text-white mt-1" style={{ fontFamily: "var(--font-serif), Georgia, serif", textShadow: "0 1px 4px oklch(0 0 0 / 0.5)" }}>{title.split(" · ")[1]}</p>
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
      </FullSection>

      {/* Personagens */}
      <FullSection id="personagens" label={get(siteContent, "section.personagens.label")} title={get(siteContent, "section.personagens.title")} description={get(siteContent, "section.personagens.description")} bannerUrl={banners.personagens} videoUrl={banners["personagens-video"]}>
        <CardCarousel>
          {characterOrder.map((key) => {
            const char = characters[key]
            const docPath = `personagens/${key}`
            const cfg = cfgFor(docPath)
            const open = isPublic(cfg, now)
            const cardInner = (
              <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: charColor(key), width: "clamp(140px, 20vw, 260px)" }}>
                {cardImages[`char-${key}`] ? (
                  <Image src={cardImages[`char-${key}`]} alt={char.name} fill sizes="(max-width: 768px) 140px, (max-width: 1280px) 200px, 260px" className="object-cover koru-card-img" />
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
      </FullSection>

      {/* Contos */}
      <FullSection id="contos" label={get(siteContent, "section.contos.label")} title={get(siteContent, "section.contos.title")} description={get(siteContent, "section.contos.description")} bannerUrl={banners.contos} videoUrl={banners["contos-video"]}>
        <CardCarousel>
          {characterOrder.filter((key) => contosAvailable.has(key) && !excluded.has(`contos/conto-${key}.md`)).map((key) => {
            const char = characters[key]
            const docPath = `contos/conto-${key}.md`
            const cfg = cfgFor(docPath)
            const open = isPublic(cfg, now)
            const cardInner = (
              <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: charColor(key), width: "clamp(140px, 20vw, 260px)" }}>
                {cardImages[`conto-${key}`] ? (
                  <Image src={cardImages[`conto-${key}`]} alt={char.name} fill sizes="(max-width: 768px) 140px, (max-width: 1280px) 200px, 260px" className="object-cover koru-card-img" />
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
      </FullSection>

      {/* Livro */}
      <FullSection id="livro" label={get(siteContent, "section.livro.label")} title={get(siteContent, "section.livro.title")} description={get(siteContent, "section.livro.description")} bannerUrl={banners.livro} videoUrl={banners["livro-video"]}>
        <CardCarousel>
          {finalLivroDocs.map((doc) => {
            const filename = pathFilename(doc.path)
            const urlSlug = livroUrlSlug(filename)
            const title = get(siteContent, `livro.${urlSlug}.title`) || doc.label
            const cfg = cfgFor(doc.path)
            const open = isPublic(cfg, now)
            const cardInner = (
              <div className="relative" style={{ aspectRatio: "2/3", backgroundColor: livroColor(urlSlug), width: "clamp(140px, 20vw, 260px)" }}>
                <LivroCardPlaceholder slug={urlSlug} />
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
      </FullSection>

      {/* Banner Final — Vídeo */}
      <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
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
