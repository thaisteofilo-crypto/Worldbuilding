import { readMarkdown, bibliaParts } from "@/lib/content"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/koru/mdx-components"
import { sanitizeForMdx } from "@/lib/sanitize-md"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DocNav } from "@/components/koru/doc-nav"

interface Props {
  params: Promise<{ parte: string }>
}

const BIBLIA_ITEMS = [
  { slug: "parte-00", title: "Manifesto" },
  { slug: "parte-01", title: "Física e Cosmologia" },
  { slug: "parte-02", title: "Geografia" },
  { slug: "parte-03", title: "Ecossistema" },
  { slug: "parte-04", title: "Criaturas" },
  { slug: "parte-05", title: "Personagens" },
  { slug: "parte-06", title: "Regras" },
  { slug: "parte-07", title: "Cultura" },
  { slug: "parte-08", title: "Linha do Tempo" },
]

export async function generateStaticParams() {
  return bibliaParts().map((p) => ({ parte: `parte-${p.parte}` }))
}

export default async function BibliaPage({ params }: Props) {
  const { parte } = await params
  const doc = readMarkdown(`biblia/${parte}.md`)
  const safeContent = sanitizeForMdx(doc.content)

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <article className="max-w-3xl mx-auto px-6 md:px-10 py-10 pb-20">
        <div className="mb-8">
          <p
            className="text-xs uppercase tracking-[0.2em] font-sans mb-2"
            style={{ color: "var(--gold)" }}
          >
            Bíblia
          </p>
          <div
            className="h-px w-16"
            style={{ backgroundColor: "var(--gold)" }}
          />
        </div>
        <MDXRemote source={safeContent} components={mdxComponents} />
        <DocNav items={BIBLIA_ITEMS} current={parte} basePath="/biblia" />
      </article>
    </ScrollArea>
  )
}
