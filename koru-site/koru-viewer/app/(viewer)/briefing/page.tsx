import { readMarkdown } from "@/lib/content"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/koru/mdx-components"
import { sanitizeForMdx } from "@/lib/sanitize-md"
import { ScrollArea } from "@/components/ui/scroll-area"

export default async function BriefingPage() {
  const doc = readMarkdown("koru-ecosystem-briefing.md")
  const safeContent = sanitizeForMdx(doc.content)

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <article className="max-w-3xl mx-auto px-6 md:px-10 py-10 pb-20">
        <div className="mb-8">
          <p
            className="text-xs uppercase tracking-[0.2em] font-sans mb-2"
            style={{ color: "var(--gold)" }}
          >
            Referência
          </p>
          <div
            className="h-px w-16"
            style={{ backgroundColor: "var(--gold)" }}
          />
        </div>
        <MDXRemote source={safeContent} components={mdxComponents} />
      </article>
    </ScrollArea>
  )
}
