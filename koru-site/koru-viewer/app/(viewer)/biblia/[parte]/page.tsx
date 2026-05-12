import { readMarkdown, readMarkdownFresh, bibliaParts, getBibliaItems } from "@/lib/content"
import { getSiteContent } from "@/lib/site-content"
import { getPublishConfig, isPublic } from "@/lib/document-publish"

import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/koru/mdx-components"
import { mdxOptions } from "@/lib/mdx-options"
import { sanitizeForMdx, stripLeadingHeadings } from "@/lib/sanitize-md"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DocNav } from "@/components/koru/doc-nav"
import { HeroBanner } from "@/components/koru/hero-banner"
import { ReadingProgress } from "@/components/koru/reading-progress"
import { BANNER_CONFIG } from "@/lib/navigation"
import { getBannerUrls } from "@/lib/banners"
import { notFound } from "next/navigation"
import { extractDescription } from "@/lib/seo"

// ISR: revalida o HTML estático a cada hora. As páginas seguem pré-renderizadas
// no build (ver generateStaticParams) e absorvem edições feitas pelo admin sem
// precisar de redeploy.
export const revalidate = 3600

interface Props {
  params: Promise<{ parte: string }>
}

export async function generateStaticParams() {
  const parts = bibliaParts().map((p) => ({ parte: `parte-${p.parte}` }))
  return [
    ...parts,
    { parte: "manifesto" },
    { parte: "glossario-de-koru" },
    { parte: "glossario-de-lugares" },
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { parte } = await params
  const bibliaItems = getBibliaItems()
  const item = bibliaItems.find((i) => i.slug === parte)
  const doc = readMarkdown(`biblia/${parte}.md`)
  const title = `${item?.title ?? doc.title} · Bíblia · Korú`
  const description = extractDescription(doc.frontmatter, doc.content)
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

export default async function BibliaPage({ params }: Props) {
  const { parte } = await params

  const validSlugs = getBibliaItems().map((i) => i.slug)
  if (!validSlugs.includes(parte)) notFound()

  const siteContent = await getSiteContent()
  if (!isPublic(getPublishConfig(siteContent, `biblia/${parte}.md`))) notFound()

  const doc = await readMarkdownFresh(`biblia/${parte}.md`)
  if (doc.title === "Documento não encontrado") notFound()
  const safeContent = sanitizeForMdx(stripLeadingHeadings(doc.content))

  const bibliaItems = getBibliaItems()
  const item = bibliaItems.find((i) => i.slug === parte)
  const bannerCfg = BANNER_CONFIG[parte] ?? { fallbackHue: 65 }
  const banners = await getBannerUrls()
  const uploadedImage = banners[`doc-${parte}`]
  const uploadedVideo = banners[`doc-${parte}-video`]

  // A "última parte" da bíblia é a maior parte-XX existente (hoje: parte-08).
  // Manifesto e glossários ficam fora dessa lógica — só partes numeradas
  // disparam a transição para a próxima seção.
  const parts = bibliaParts()
  const lastPartSlug = parts.length > 0 ? `parte-${parts[parts.length - 1].parte}` : null
  const sectionTransition =
    parte === lastPartSlug
      ? {
          href: "/personagens",
          label: "Conheça quem habita o Akwu",
          description: "Os personagens que dão forma à física da memória.",
        }
      : undefined

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <HeroBanner
        title={item?.title ?? doc.title}
        subtitle="Bíblia do Mundo"
        accentColor="var(--gold)"
        fallbackHue={bannerCfg.fallbackHue}
        videoSrc={uploadedVideo ?? bannerCfg.videoSrc}
        imageSrc={uploadedImage ?? bannerCfg.imageSrc}
      />
      <article className="max-w-prose md:max-w-3xl mx-auto px-6 md:px-10 py-10 pb-20">
        <ReadingProgress />
        <MDXRemote source={safeContent} components={mdxComponents} options={mdxOptions} />
        <DocNav
          items={bibliaItems}
          current={parte}
          basePath="/biblia"
          sectionTransition={sectionTransition}
        />
      </article>
    </ScrollArea>
  )
}
