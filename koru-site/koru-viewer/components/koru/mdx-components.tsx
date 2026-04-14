import type { MDXComponents } from "mdx/types"
import type { ReactNode } from "react"
import React from "react"
import { GLOSSARY, getGlossaryEntry } from "@/lib/glossary"
import { GlossaryTerm } from "@/components/koru/glossary-term"

// Build a single regex that matches any glossary term or alias as whole words.
// Terms with spaces (e.g. "Bomi Veh") are included literally; the \b anchor
// handles word boundaries around them.
function buildGlossaryRegex(): RegExp {
  const patterns = GLOSSARY.flatMap((e) => [
    e.term,
    ...(e.aliases ?? []),
  ])
  // Sort longest first so multi-word terms are matched before shorter substrings.
  patterns.sort((a, b) => b.length - a.length)
  const escaped = patterns.map((p) =>
    p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  )
  return new RegExp(`\\b(${escaped.join("|")})\\b`, "gi")
}

const GLOSSARY_REGEX = buildGlossaryRegex()

/**
 * Processes a single string node and returns an array of plain strings
 * interspersed with <GlossaryTerm> elements wherever a glossary term appears.
 * Case of the original text is preserved; lookup is case-insensitive.
 */
function highlightGlossaryTerms(text: string): ReactNode[] {
  const result: ReactNode[] = []
  // Reset lastIndex in case the regex is reused across calls.
  GLOSSARY_REGEX.lastIndex = 0
  let last = 0
  let match: RegExpExecArray | null

  while ((match = GLOSSARY_REGEX.exec(text)) !== null) {
    const [matched] = match
    const start = match.index

    // Push the plain text before the match.
    if (start > last) {
      result.push(text.slice(last, start))
    }

    // Look up the entry (case-insensitive via getGlossaryEntry).
    const entry = getGlossaryEntry(matched)
    if (entry) {
      result.push(
        <GlossaryTerm
          key={start}
          term={entry.term}
          definition={entry.definition}
          category={entry.category ?? ""}
        >
          {matched}
        </GlossaryTerm>
      )
    } else {
      // Fallback: entry not found (shouldn't happen), render plain text.
      result.push(matched)
    }

    last = start + matched.length
  }

  // Push any remaining plain text after the last match.
  if (last < text.length) {
    result.push(text.slice(last))
  }

  return result
}

/**
 * Processes the children of a <p> element. Only string children are
 * passed through highlightGlossaryTerms; React element children
 * (e.g. <strong>, <em>, <a>) are left untouched to avoid re-wrapping.
 */
function processParagraphChildren(children: ReactNode): ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      const parts = highlightGlossaryTerms(child)
      // If nothing was highlighted, return the original string unchanged.
      return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts
    }
    // React elements (strong, em, a, etc.) pass through unmodified.
    return child
  })
}

// Drop cap: applies only to the first <p> directly after an <h1> or <h2>
// Uses CSS adjacent sibling selector — no JS needed, no class on every paragraph
const DROP_CAP_STYLE = `
  .mdx-article h1 + p::first-letter,
  .mdx-article h2 + p::first-letter {
    float: left;
    font-size: 3.5em;
    line-height: 0.8;
    padding-right: 0.12em;
    padding-top: 0.05em;
    font-family: var(--font-serif), Georgia, serif;
    color: var(--gold);
    font-style: normal;
  }
`

function MDXWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="mdx-article">
      <style dangerouslySetInnerHTML={{ __html: DROP_CAP_STYLE }} />
      {children}
    </div>
  )
}

export const mdxComponents: MDXComponents = {
  wrapper: MDXWrapper,
  h1: ({ children }) => (
    <h1
      className="font-serif text-5xl md:text-6xl leading-tight mt-10 mb-6"
      style={{
        fontFamily: "var(--font-serif), Georgia, serif",
        color: "var(--foreground)",
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      className="font-serif text-3xl md:text-4xl leading-tight mt-10 mb-4 pb-3"
      style={{
        fontFamily: "var(--font-serif), Georgia, serif",
        color: "var(--foreground)",
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      className="font-sans font-semibold text-xl mt-8 mb-3"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4
      className="font-sans font-medium text-base uppercase tracking-[0.1em] mt-6 mb-2"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p
      className="font-sans text-base leading-[1.8] mb-4"
      style={{ color: "var(--foreground)" }}
    >
      {processParagraphChildren(children)}
    </p>
  ),
  strong: ({ children }) => (
    <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em style={{ color: "var(--foreground)", fontStyle: "italic" }}>{children}</em>
  ),
  code: ({ children }) => (
    <code
      className="font-mono text-sm px-1.5 py-0.5 rounded-sm"
      style={{
        backgroundColor: "var(--surface)",
        color: "var(--foreground)",
      }}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      className="font-mono text-sm p-4 rounded-sm overflow-x-auto my-6"
      style={{
        backgroundColor: "var(--surface)",
        color: "var(--foreground)",
      }}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="my-8 pl-6 py-1 font-sans text-base leading-[1.9]"
      style={{
        borderLeft: "2px solid var(--accent)",
        fontStyle: "italic",
        color: "color-mix(in oklch, var(--foreground) 72%, transparent)",
      }}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul
      className="font-sans text-base leading-[1.8] mb-4 pl-6 list-disc space-y-1"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      className="font-sans text-base leading-[1.8] mb-4 pl-6 list-decimal space-y-1"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li
      className="relative pl-1"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </li>
  ),
  hr: () => (
    <div className="flex items-center justify-center my-10" role="separator" aria-hidden="true">
      <div className="flex-1 border-t" style={{ borderColor: "color-mix(in oklch, var(--border) 60%, transparent)" }} />
      <span
        className="mx-4 font-serif text-sm select-none"
        style={{ color: "var(--gold)", opacity: 0.65 }}
      >
        ◆
      </span>
      <div className="flex-1 border-t" style={{ borderColor: "color-mix(in oklch, var(--border) 60%, transparent)" }} />
    </div>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 glass-card rounded-2xl">
      <table className="w-full text-sm font-sans border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ backgroundColor: "color-mix(in oklch, var(--surface) 50%, transparent)" }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th
      className="px-4 py-3 text-left text-xs uppercase tracking-[0.1em] font-medium"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      className="px-4 py-3"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="transition-colors" style={{ borderBottom: "1px solid color-mix(in oklch, var(--border) 30%, transparent)" }}>
      {children}
    </tr>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="underline underline-offset-2 transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
      style={{ color: "var(--foreground)", outlineColor: "var(--foreground)" }}
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ""}
      className="w-full rounded-xl my-6"
      style={{ maxWidth: "100%" }}
    />
  ),
  video: (props: React.ComponentProps<"video">) => (
    <video
      {...props}
      controls
      className="w-full rounded-xl my-6"
      style={{ maxWidth: "100%" }}
    />
  ),
  audio: (props: React.ComponentProps<"audio">) => (
    <audio
      {...props}
      controls
      className="w-full my-6"
    />
  ),
}
