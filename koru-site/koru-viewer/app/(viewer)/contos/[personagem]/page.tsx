import { readMarkdownFresh, contoSlugs, getContosItems } from "@/lib/content"

export const dynamic = "force-dynamic"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/koru/mdx-components"
import { mdxOptions } from "@/lib/mdx-options"
import { sanitizeForMdx, stripLeadingHeadings } from "@/lib/sanitize-md"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getCharactersForViewer } from "@/lib/characters-db"
import { DocNav } from "@/components/koru/doc-nav"
import { HeroBanner } from "@/components/koru/hero-banner"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ personagem: string }>
}

const literaryComponents = {
  ...mdxComponents,
  p: ({ children }: { children?: React.ReactNode }) => (
    <p
      className="font-sans text-base leading-[1.85] mb-5"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </p>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3
      className="font-sans font-semibold text-xl leading-tight mt-10 mb-3"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4
      className="font-sans font-medium text-lg leading-tight mt-8 mb-2 opacity-75"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </h4>
  ),
}

export async function generateStaticParams() {
  return contoSlugs()
}

export default async function ContoPage({ params }: Props) {
  const { personagem } = await params

  const validSlugs = contoSlugs().map((s) => s.personagem)
  if (!validSlugs.includes(personagem)) notFound()

  const doc = await readMarkdownFresh(`contos/conto-${personagem}.md`)
  if (doc.title === "Documento não encontrado") notFound()
  const safeContent = sanitizeForMdx(stripLeadingHeadings(doc.content))
  const { chars } = await getCharactersForViewer()
  const char = chars[personagem]

  const contosItems = getContosItems()
  const item = contosItems.find((i) => i.slug === personagem)

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <HeroBanner
        title={item?.title ?? char?.name ?? personagem}
        subtitle="Conto"
        accentColor="var(--blue-cold)"
        fallbackHue={220}
      />
      <article className="max-w-3xl mx-auto px-6 md:px-10 py-10 pb-20">
        <MDXRemote source={safeContent} components={literaryComponents} options={mdxOptions} />
        <DocNav items={contosItems} current={personagem} basePath="/contos" />
      </article>
    </ScrollArea>
  )
}
