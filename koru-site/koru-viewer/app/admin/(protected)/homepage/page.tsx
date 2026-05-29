"use client"

import Image from "next/image"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CardCarousel } from "@/components/koru/card-carousel"
import {
  EditModeProvider,
  EditModeBar,
  EditableHero,
  EditableSection,
  EditableCard,
  AdminFooterSection,
  useHomepageData,
  useSaveContent,
  useUploadCardImage,
  useUploadBanner,
} from "@/components/admin/homepage-editor"

// ---------------------------------------------------------------------------
// Static slug lists (hardcoded — page is client-side, no fs access)
// ---------------------------------------------------------------------------

const BIBLIA_SLUGS = [
  "parte-00-manifesto",
  "parte-01-fisica-cosmologia",
  "parte-02-geografia",
  "parte-03-ecossistema",
  "parte-04-criaturas",
  "parte-05-personagens",
  "parte-06-regras",
  "parte-07-cultura",
  "parte-08-linha-do-tempo",
  "glossario-de-koru",
  "glossario-de-lugares",
]

const LIVRO_SLUGS = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12",
  "epilogo",
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bibliaCardKey(slug: string): string {
  return `biblia-${slug}`
}

function livroCardKey(slug: string): string {
  return `livro-${slug}`
}

function contoCardKey(personagem: string): string {
  return `conto-${personagem}`
}

function charCardKey(personagem: string): string {
  return `char-${personagem}`
}

// "parte-00-manifesto" → "biblia.parte-00-manifesto.title"
function bibliaTitleKey(slug: string): string {
  return `biblia.${slug}.title`
}

// "01" → "livro.01.title", "epilogo" → "livro.epilogo.title"
function livroTitleKey(slug: string): string {
  return `livro.${slug}.title`
}

// Default display titles when no override is in siteContent
const BIBLIA_DEFAULT_TITLES: Record<string, string> = {
  "parte-00-manifesto": "Introdução · A Língua de Korú",
  "parte-01-fisica-cosmologia": "Física · A Natureza do Akwu",
  "parte-02-geografia": "Geografia · Ikwe e seus Lugares",
  "parte-03-ecossistema": "Ecossistema · O Ciclo da Memória",
  "parte-04-criaturas": "Criaturas · Os Seres de Korú",
  "parte-05-personagens": "Personagens · Quem Habita",
  "parte-06-regras": "Regras · Os 13 Acordos",
  "parte-07-cultura": "Cultura · Como se Vive",
  "parte-08-linha-do-tempo": "Linha do Tempo · As Seis Eras",
  "glossario-de-koru": "Glossário de Korú",
  "glossario-de-lugares": "Glossário de Lugares",
}

const LIVRO_DEFAULT_TITLES: Record<string, string> = {
  "01": "O que ela é",
  "02": "Manhãs",
  "03": "A cidade",
  "04": "A mentira silenciosa",
  "05": "Entre o lilás e o cinza",
  "06": "O que a floresta guarda",
  "07": "O projeto do fim do luto",
  "08": "A chuva",
  "09": "O limiar como morada",
  "10": "A noite antes",
  "11": "O que ela paga",
  "12": "O retorno",
  "epilogo": "Epílogo",
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function HomepageSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6" aria-busy="true" aria-label="Carregando editor da homepage…">
      {/* EditModeBar placeholder */}
      <Skeleton className="h-11 w-full rounded-none" />
      {/* Hero placeholder */}
      <Skeleton className="w-full rounded-xl" style={{ minHeight: "30vh" }} />
      {/* Section skeletons */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 px-4 md:px-16 py-8">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-10 w-64 rounded" />
          <Skeleton className="h-5 w-96 rounded" />
          <div className="flex gap-3 mt-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="rounded-xl shrink-0" style={{ width: 160, aspectRatio: "2/3" }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Image placeholder (used when card has no image yet)
// ---------------------------------------------------------------------------

function ImagePlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        className="opacity-15"
        style={{ color: "var(--muted-foreground)" }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AdminHomepageInner — consumes hooks inside EditModeProvider
// ---------------------------------------------------------------------------

function AdminHomepageInner() {
  const { siteContent, banners, cardImages, characters, characterOrder, loading } =
    useHomepageData()
  const { save } = useSaveContent()
  const { upload: uploadCardImage } = useUploadCardImage()
  const { upload: uploadBanner } = useUploadBanner()

  // Publish state: local map keyed by doc path; all start as published (true)
  const [publishedMap, setPublishedMap] = useState<Record<string, boolean>>({})

  function isPublished(key: string): boolean {
    return publishedMap[key] !== false
  }

  function togglePublished(key: string) {
    setPublishedMap((prev) => ({ ...prev, [key]: !isPublished(key) }))
  }

  if (loading) return <HomepageSkeleton />

  const get = (key: string, fallback = ""): string =>
    siteContent?.[key] ?? fallback

  const heroImage = banners?.["hero"]
  const heroVideo = banners?.["hero-video"]

  // CTA target: first biblia slug
  const bibliaHref = `/biblia/${BIBLIA_SLUGS[0]}`

  // Characters with contos: use characterOrder filtered by whether a conto card
  // key could exist. In the admin we show all chars, toggling publish state.
  const charsWithContos = characterOrder

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed edit bar */}
      <EditModeBar />

      <div style={{ marginTop: 44 }}>
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <EditableHero
          heroImage={heroImage}
          heroVideo={heroVideo}
          tagline={get("hero.tagline", "Um mundo cuja física é baseada em memória.")}
          bibliaHref={bibliaHref}
          onSave={save}
          onBannerUpload={uploadBanner}
        />

        {/* ── Bíblia ────────────────────────────────────────────────── */}
        <EditableSection
          title={get("section.biblia.title", "O arquivo vivo")}
          titleKey="section.biblia.title"
          description={get("section.biblia.description")}
          descriptionKey="section.biblia.description"
          label={get("section.biblia.label", "Bíblia do Mundo")}
          labelKey="section.biblia.label"
          bannerUrl={banners?.["biblia"]}
          videoUrl={banners?.["biblia-video"]}
          bannerSlot="biblia"
          onSave={save}
          onBannerUpload={uploadBanner}
        >
          <CardCarousel>
            {BIBLIA_SLUGS.map((slug) => {
              const cardKey = bibliaCardKey(slug)
              const titleKey = bibliaTitleKey(slug)
              const title = get(titleKey, BIBLIA_DEFAULT_TITLES[slug] ?? slug)
              const imgUrl = cardImages?.[cardKey]
              const published = isPublished(`biblia/${slug}.md`)
              const kicker = title.includes(" · ") ? title.split(" · ")[0] : undefined
              const displayTitle = title.includes(" · ") ? title.split(" · ")[1] : title

              return (
                <EditableCard
                  key={slug}
                  cardKey={cardKey}
                  title={title}
                  titleKey={titleKey}
                  kicker={kicker}
                  href={`/biblia/${slug}`}
                  published={published}
                  onTogglePublish={() => togglePublished(`biblia/${slug}.md`)}
                  onSave={save}
                  onImageUpload={(file) => uploadCardImage(file, cardKey)}
                >
                  <div
                    className="relative"
                    style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}
                  >
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={title}
                        fill
                        className="object-cover koru-card-img"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20">
                      {kicker && (
                        <p className="text-xs md:text-sm font-sans text-white/50">{kicker}</p>
                      )}
                      <p
                        className="font-serif text-lg md:text-2xl font-medium leading-tight text-white mt-1"
                        style={{
                          fontFamily: "var(--font-serif), Georgia, serif",
                          textShadow: "0 1px 4px oklch(0 0 0 / 0.5)",
                        }}
                      >
                        {displayTitle}
                      </p>
                    </div>
                  </div>
                </EditableCard>
              )
            })}
          </CardCarousel>
        </EditableSection>

        {/* ── Personagens ───────────────────────────────────────────── */}
        <EditableSection
          title={get("section.personagens.title", "Os seres do Akwu")}
          titleKey="section.personagens.title"
          description={get("section.personagens.description")}
          descriptionKey="section.personagens.description"
          label={get("section.personagens.label", "Personagens")}
          labelKey="section.personagens.label"
          bannerUrl={banners?.["personagens"]}
          videoUrl={banners?.["personagens-video"]}
          bannerSlot="personagens"
          onSave={save}
          onBannerUpload={uploadBanner}
        >
          <CardCarousel>
            {characterOrder.map((key) => {
              const char = characters?.[key]
              if (!char) return null
              const cardKey = charCardKey(key)
              const imgUrl = cardImages?.[cardKey]
              const published = isPublished(`personagens/${key}`)

              return (
                <EditableCard
                  key={key}
                  cardKey={cardKey}
                  title={char.name}
                  href={`/personagens/${key}`}
                  published={published}
                  onTogglePublish={() => togglePublished(`personagens/${key}`)}
                  onSave={save}
                  onImageUpload={(file) => uploadCardImage(file, cardKey)}
                >
                  <div
                    className="relative"
                    style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}
                  >
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={char.name}
                        fill
                        className="object-cover koru-card-img"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20">
                      <p
                        className="font-serif text-lg md:text-2xl leading-tight text-white"
                        style={{
                          fontFamily: "var(--font-serif), Georgia, serif",
                          textShadow: "0 1px 4px oklch(0 0 0 / 0.5)",
                        }}
                      >
                        {char.name}
                      </p>
                      <p className="text-sm md:text-base font-sans text-white/70 mt-1">
                        {char.role.split(",")[0].trim()}
                      </p>
                    </div>
                  </div>
                </EditableCard>
              )
            })}
          </CardCarousel>
        </EditableSection>

        {/* ── Contos ────────────────────────────────────────────────── */}
        <EditableSection
          title={get("section.contos.title", "Vozes do Akwu")}
          titleKey="section.contos.title"
          description={get("section.contos.description")}
          descriptionKey="section.contos.description"
          label={get("section.contos.label", "Contos")}
          labelKey="section.contos.label"
          bannerUrl={banners?.["contos"]}
          videoUrl={banners?.["contos-video"]}
          bannerSlot="contos"
          onSave={save}
          onBannerUpload={uploadBanner}
        >
          <CardCarousel>
            {charsWithContos.map((key) => {
              const char = characters?.[key]
              if (!char) return null
              const cardKey = contoCardKey(key)
              const imgUrl = cardImages?.[cardKey]
              const published = isPublished(`contos/conto-${key}.md`)

              return (
                <EditableCard
                  key={key}
                  cardKey={cardKey}
                  title={char.name}
                  kicker="Conto"
                  href={`/contos/${key}`}
                  published={published}
                  onTogglePublish={() => togglePublished(`contos/conto-${key}.md`)}
                  onSave={save}
                  onImageUpload={(file) => uploadCardImage(file, cardKey)}
                >
                  <div
                    className="relative"
                    style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}
                  >
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={char.name}
                        fill
                        className="object-cover koru-card-img"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20">
                      <p className="text-xs md:text-base font-sans text-white/60">Conto</p>
                      <p
                        className="font-serif text-lg md:text-2xl font-medium leading-tight text-white mt-1"
                        style={{
                          fontFamily: "var(--font-serif), Georgia, serif",
                          textShadow: "0 1px 4px oklch(0 0 0 / 0.5)",
                        }}
                      >
                        {char.name}
                      </p>
                    </div>
                  </div>
                </EditableCard>
              )
            })}
          </CardCarousel>
        </EditableSection>

        {/* ── Livro ─────────────────────────────────────────────────── */}
        <EditableSection
          title={get("section.livro.title", "O Peso da Luz")}
          titleKey="section.livro.title"
          description={get("section.livro.description")}
          descriptionKey="section.livro.description"
          label={get("section.livro.label", "Livro")}
          labelKey="section.livro.label"
          bannerUrl={banners?.["livro"]}
          videoUrl={banners?.["livro-video"]}
          bannerSlot="livro"
          onSave={save}
          onBannerUpload={uploadBanner}
        >
          <CardCarousel>
            {LIVRO_SLUGS.map((slug) => {
              const cardKey = livroCardKey(slug)
              const titleKey = livroTitleKey(slug)
              const title = get(titleKey, LIVRO_DEFAULT_TITLES[slug] ?? `Capítulo ${slug}`)
              const imgUrl = cardImages?.[cardKey]
              const published = isPublished(
                slug === "epilogo" ? "livro/epilogo.md" : `livro/capitulo-${slug}.md`
              )
              const kicker = slug === "epilogo" ? "Fim" : `Cap. ${slug}`

              return (
                <EditableCard
                  key={slug}
                  cardKey={cardKey}
                  title={title}
                  titleKey={titleKey}
                  kicker={kicker}
                  href={`/livro/${slug}`}
                  published={published}
                  onTogglePublish={() =>
                    togglePublished(
                      slug === "epilogo" ? "livro/epilogo.md" : `livro/capitulo-${slug}.md`
                    )
                  }
                  onSave={save}
                  onImageUpload={(file) => uploadCardImage(file, cardKey)}
                >
                  <div
                    className="relative"
                    style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}
                  >
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={title}
                        fill
                        className="object-cover koru-card-img"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, transparent 50%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20">
                      <p className="text-xs md:text-base font-sans text-white/60">{kicker}</p>
                      <p
                        className="font-serif text-lg md:text-2xl font-medium leading-tight text-white mt-1"
                        style={{
                          fontFamily: "var(--font-serif), Georgia, serif",
                          textShadow: "0 1px 4px oklch(0 0 0 / 0.5)",
                        }}
                      >
                        {title}
                      </p>
                    </div>
                  </div>
                </EditableCard>
              )
            })}
          </CardCarousel>
        </EditableSection>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <AdminFooterSection
          footerImage={banners?.["footer"]}
          footerVideo={banners?.["footer-video"]}
          copyright={get("footer.copyright", "Todos os direitos reservados a Thaís Teófilo")}
          copyrightKey="footer.copyright"
          onSave={save}
          onBannerUpload={uploadBanner}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Default export — wraps inner component in EditModeProvider
// ---------------------------------------------------------------------------

export default function AdminHomepagePage() {
  return (
    <EditModeProvider>
      <AdminHomepageInner />
    </EditModeProvider>
  )
}
