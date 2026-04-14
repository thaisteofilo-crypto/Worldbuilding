import { readMarkdown, bibliaParts, getBibliaItems } from "@/lib/content"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/koru/mdx-components"
import { mdxOptions } from "@/lib/mdx-options"
import { sanitizeForMdx, stripLeadingHeadings } from "@/lib/sanitize-md"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DocNav } from "@/components/koru/doc-nav"
import { HeroBanner } from "@/components/koru/hero-banner"
import { BANNER_CONFIG } from "@/lib/navigation"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ parte: string }>
}

export async function generateStaticParams() {
  return bibliaParts().map((p) => ({ parte: `parte-${p.parte}` }))
}

export default async function BibliaPage({ params }: Props) {
  const { parte } = await params

  const validSlugs = getBibliaItems().map((i) => i.slug)
  if (!validSlugs.includes(parte)) notFound()

  const doc = readMarkdown(`biblia/${parte}.md`)
  if (doc.title === "Documento não encontrado") notFound()
  const safeContent = sanitizeForMdx(stripLeadingHeadings(doc.content))

  const bibliaItems = getBibliaItems()
  const item = bibliaItems.find((i) => i.slug === parte)
  const bannerCfg = BANNER_CONFIG[parte] ?? { fallbackHue: 65 }

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <HeroBanner
        title={item?.title ?? doc.title}
        subtitle="Bíblia do Mundo"
        accentColor="var(--gold)"
        fallbackHue={bannerCfg.fallbackHue}
        videoSrc={bannerCfg.videoSrc}
        imageSrc={bannerCfg.imageSrc}
      />
      <article className="max-w-3xl mx-auto px-6 md:px-10 py-10 pb-20">
        <MDXRemote source={safeContent} components={mdxComponents} options={mdxOptions} />
        <DocNav items={bibliaItems} current={parte} basePath="/biblia" />
      </article>
    </ScrollArea>
  )
}
