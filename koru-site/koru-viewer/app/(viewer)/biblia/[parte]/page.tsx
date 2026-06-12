import { readMarkdownFresh, bibliaParts, getBibliaItems } from "@/lib/content"
import { getSiteContent } from "@/lib/site-content"
import { getPublishConfig, isPublic } from "@/lib/document-publish"

export const dynamic = "force-dynamic"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/koru/mdx-components"
import { mdxOptions } from "@/lib/mdx-options"
import { sanitizeForMdx, stripLeadingHeadings } from "@/lib/sanitize-md"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DocNav } from "@/components/koru/doc-nav"
import { HeroBanner } from "@/components/koru/hero-banner"
import { ReadingPosition } from "@/components/koru/reading-position"
import { ReadingProgress } from "@/components/koru/reading-progress"
import { BackToTop } from "@/components/koru/back-to-top"
import { KeyboardNav } from "@/components/koru/keyboard-nav"
import { Toc } from "@/components/koru/toc"
import { extractHeadings, estimateReadingMinutes } from "@/components/koru/content-utils"
import { BANNER_CONFIG } from "@/lib/navigation"
import { getBannerUrls } from "@/lib/banners"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ parte: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { parte } = await params
  const item = getBibliaItems().find((i) => i.slug === parte)
  if (!item) return {}
  return {
    title: item.title,
    description: `${item.title} — Bíblia do Mundo de Korú.`,
  }
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

  const title = item?.title ?? doc.title
  const readingMinutes = estimateReadingMinutes(doc.content)
  const headings = extractHeadings(safeContent)

  const idx = bibliaItems.findIndex((i) => i.slug === parte)
  const prevItem = idx > 0 ? bibliaItems[idx - 1] : null
  const nextItem = idx >= 0 && idx < bibliaItems.length - 1 ? bibliaItems[idx + 1] : null

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <HeroBanner
        title={title}
        subtitle="Bíblia do Mundo"
        meta={`~${readingMinutes} min de leitura`}
        accentColor="var(--gold)"
        fallbackHue={bannerCfg.fallbackHue}
        videoSrc={uploadedVideo ?? bannerCfg.videoSrc}
        imageSrc={uploadedImage ?? bannerCfg.imageSrc}
      />
      <article className="max-w-3xl mx-auto px-6 md:px-10 py-10 pb-20">
        <MDXRemote source={safeContent} components={mdxComponents} options={mdxOptions} />
        <DocNav items={bibliaItems} current={parte} basePath="/biblia" />
      </article>
      <ReadingPosition title={title} section="Bíblia do Mundo" />
      <ReadingProgress />
      <BackToTop />
      <KeyboardNav
        prevHref={prevItem ? `/biblia/${prevItem.slug}` : null}
        nextHref={nextItem ? `/biblia/${nextItem.slug}` : null}
      />
      {headings.length >= 3 && <Toc items={headings} />}
    </ScrollArea>
  )
}
