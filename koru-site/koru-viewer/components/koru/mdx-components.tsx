import type { MDXComponents } from "mdx/types"

export const mdxComponents: MDXComponents = {
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
      {children}
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
      className="my-6 pl-5 py-3 font-sans text-base leading-[1.8]"
      style={{
        borderLeft: "3px solid var(--border)",
        color: "var(--foreground)",
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
  hr: () => null,
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
}
