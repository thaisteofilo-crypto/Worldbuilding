import { readMarkdown, readMarkdownFresh, contoSlugs, getContosItems } from "@/lib/content"
import { getSiteContent } from "@/lib/site-content"
import { getPublishConfig, isPublic } from "@/lib/document-publish"

import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/koru/mdx-components"
import { mdxOptions } from "@/lib/mdx-options"
import { sanitizeForMdx, stripLeadingHeadings } from "@/lib/sanitize-md"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getCharactersForViewer } from "@/lib/characters-db"
import { DocNav } from "@/components/koru/doc-nav"
import { HeroBanner } from "@/components/koru/hero-banner"
import { ReadingProgress } from "@/components/koru/reading-progress"
import { notFound } from "next/navigation"
import { extractDescription } from "@/lib/seo"

// ISR: regenera o HTML a cada hora preservando geração estática.
export const revalidate = 3600

interface Props {
  params: Promise<{ personagem: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { personagem } = await params
  const contosItems = getContosItems()
  const item = contosItems.find((i) => i.slug === personagem)
  const personagemNome = item?.title?.split(" · ")[0] ?? personagem
  const doc = readMarkdown(`contos/conto-${personagem}.md`)
  const title = `${personagemNome} · Contos · Korú`
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

const literaryComponents = {
  ...mdxComponents,
  p: ({ children }: { children?: React.ReactNode }) => (
    <p
      className="font-sans text-base leading-[1.75] mb-5"
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

  const docPath = `contos/conto-${personagem}.md`
  const siteContent = await getSiteContent()
  if (!isPublic(getPublishConfig(siteContent, docPath))) notFound()

  const doc = await readMarkdownFresh(docPath)
  if (doc.title === "Documento não encontrado") notFound()
  const safeContent = sanitizeForMdx(stripLeadingHeadings(doc.content))
  const { chars } = await getCharactersForViewer()
  const char = chars[personagem]

  const contosItems = getContosItems()
  const item = contosItems.find((i) => i.slug === personagem)

  // Ordem de leitura canônica dos contos. O último ("orike") encerra o ciclo
  // e leva o leitor para a abertura do livro.
  const READING_ORDER = ["amara", "oruku", "beku", "obaru", "kemdi", "temi", "orike"] as const
  const isLastInOrder = personagem === READING_ORDER[READING_ORDER.length - 1]
  const sectionTransition = isLastInOrder
    ? {
        href: "/livro/01",
        label: "Entre na narrativa de Temiku",
        description: "Doze capítulos que entrelaçam os fios de tudo o que você leu.",
      }
    : undefined

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <HeroBanner
        title={item?.title ?? char?.name ?? personagem}
        subtitle="Conto"
        accentColor="var(--blue-cold)"
        fallbackHue={220}
      />
      <article className="max-w-prose md:max-w-3xl mx-auto px-6 md:px-10 py-10 pb-20">
        <ReadingProgress />
        <MDXRemote source={safeContent} components={literaryComponents} options={mdxOptions} />
        <DocNav
          items={contosItems}
          current={personagem}
          basePath="/contos"
          sectionTransition={sectionTransition}
        />
      </article>
    </ScrollArea>
  )
}
