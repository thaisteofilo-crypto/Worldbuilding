import { readMarkdown, contoSlugs } from "@/lib/content"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/koru/mdx-components"
import { mdxOptions } from "@/lib/mdx-options"
import { sanitizeForMdx } from "@/lib/sanitize-md"
import { ScrollArea } from "@/components/ui/scroll-area"
import { characters } from "@/lib/characters"
import { DocNav } from "@/components/koru/doc-nav"

interface Props {
  params: Promise<{ personagem: string }>
}

const CONTOS_ITEMS = [
  { slug: "temiku", title: "Temiku" },
  { slug: "amara", title: "Amara" },
  { slug: "oruku", title: "Oruku" },
  { slug: "beku", title: "Beku" },
  { slug: "obaru", title: "Obaru" },
  { slug: "kemdi", title: "Kemdi" },
  { slug: "orike", title: "Orike" },
]

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
  const doc = readMarkdown(`contos/conto-${personagem}.md`)
  const safeContent = sanitizeForMdx(doc.content)
  const char = characters[personagem]

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      {/* Character accent header strip */}
      {char && (
        <div
          className="h-1 w-full"
          style={{ background: char.gradient }}
        />
      )}
      <article className="max-w-3xl mx-auto px-6 md:px-10 py-10 pb-20">
        <div className="mb-8">
          <p
            className="text-xs uppercase tracking-[0.2em] font-sans mb-2"
            style={{ color: "var(--blue-cold)" }}
          >
            Conto
          </p>
          {char && (
            <p
              className="font-serif text-4xl md:text-5xl leading-none mb-3"
              style={{
                fontFamily: "var(--font-serif), Georgia, serif",
                color: "var(--foreground)",
              }}
            >
              {char.name}
            </p>
          )}
          <div
            className="h-px w-16"
            style={{ backgroundColor: "var(--blue-cold)" }}
          />
        </div>
        <MDXRemote source={safeContent} components={literaryComponents} options={mdxOptions} />
        <DocNav items={CONTOS_ITEMS} current={personagem} basePath="/contos" />
      </article>
    </ScrollArea>
  )
}
