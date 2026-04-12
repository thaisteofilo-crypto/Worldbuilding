import { readMarkdown, bibliaParts } from "@/lib/content"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/koru/mdx-components"
import { mdxOptions } from "@/lib/mdx-options"
import { sanitizeForMdx } from "@/lib/sanitize-md"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DocNav } from "@/components/koru/doc-nav"
import { HeroBanner } from "@/components/koru/hero-banner"

interface Props {
  params: Promise<{ parte: string }>
}

const BIBLIA_ITEMS = [
  { slug: "parte-00", title: "Introdução" },
  { slug: "parte-01", title: "Física e Cosmologia" },
  { slug: "parte-02", title: "Geografia" },
  { slug: "parte-03", title: "Ecossistema" },
  { slug: "parte-04", title: "Criaturas" },
  { slug: "parte-05", title: "Personagens" },
  { slug: "parte-06", title: "Regras" },
  { slug: "parte-07", title: "Cultura" },
  { slug: "parte-08", title: "Linha do Tempo" },
]

const BANNER_CONFIG: Record<string, { fallbackHue: number; videoSrc?: string; imageSrc?: string }> = {
  "parte-00": { fallbackHue: 65 },
  "parte-01": { fallbackHue: 290 },
  "parte-02": { fallbackHue: 140 },
  "parte-03": { fallbackHue: 120 },
  "parte-04": { fallbackHue: 35 },
  "parte-05": { fallbackHue: 220 },
  "parte-06": { fallbackHue: 75 },
  "parte-07": { fallbackHue: 310 },
  "parte-08": { fallbackHue: 50 },
}

export async function generateStaticParams() {
  return bibliaParts().map((p) => ({ parte: `parte-${p.parte}` }))
}

export default async function BibliaPage({ params }: Props) {
  const { parte } = await params
  const doc = readMarkdown(`biblia/${parte}.md`)
  const safeContent = sanitizeForMdx(doc.content)

  const item = BIBLIA_ITEMS.find((i) => i.slug === parte)
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
        <DocNav items={BIBLIA_ITEMS} current={parte} basePath="/biblia" />
      </article>
    </ScrollArea>
  )
}
