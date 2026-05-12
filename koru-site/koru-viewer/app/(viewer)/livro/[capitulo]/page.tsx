import { readMarkdown, readMarkdownFresh, livroChapters, getLivroItems } from "@/lib/content"
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
import { notFound } from "next/navigation"
import { extractDescription } from "@/lib/seo"

// ISR: regenera o HTML a cada hora preservando geração estática.
export const revalidate = 3600

interface Props {
  params: Promise<{ capitulo: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { capitulo } = await params
  const filePath =
    capitulo === "epilogo" ? "livro/epilogo.md" : `livro/capitulo-${capitulo}.md`
  const doc = readMarkdown(filePath)
  const title =
    capitulo === "epilogo"
      ? `Epílogo · O Livro · Korú`
      : `Capítulo ${parseInt(capitulo)} · O Livro · Korú`
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
  return livroChapters()
}

export default async function LivroPage({ params }: Props) {
  const { capitulo } = await params

  const validSlugs = livroChapters().map((c) => c.capitulo)
  if (!validSlugs.includes(capitulo)) notFound()

  const filePath =
    capitulo === "epilogo"
      ? "livro/epilogo.md"
      : `livro/capitulo-${capitulo}.md`

  const siteContent = await getSiteContent()
  if (!isPublic(getPublishConfig(siteContent, filePath))) notFound()

  const doc = await readMarkdownFresh(filePath)
  if (doc.title === "Documento não encontrado") notFound()
  const safeContent = sanitizeForMdx(stripLeadingHeadings(doc.content))

  const livroItems = getLivroItems()
  const item = livroItems.find((i) => i.slug === capitulo)

  // O epílogo encerra a leitura linear; aponta o leitor de volta ao início.
  const sectionTransition =
    capitulo === "epilogo"
      ? {
          href: "/",
          label: "Volte ao início do Akwu",
          description: "Releia a bíblia ou siga outro fio.",
        }
      : undefined

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <HeroBanner
        title={item?.title ?? doc.title}
        subtitle="Livro"
        accentColor="var(--accent)"
        fallbackHue={290}
      />
      <article className="max-w-prose md:max-w-3xl mx-auto px-6 md:px-10 py-10 pb-20">
        <ReadingProgress />
        <MDXRemote source={safeContent} components={literaryComponents} options={mdxOptions} />
        <DocNav
          items={livroItems}
          current={capitulo}
          basePath="/livro"
          sectionTransition={sectionTransition}
        />
      </article>
    </ScrollArea>
  )
}
