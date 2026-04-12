import type { MDXComponents } from "mdx/types"

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1
      className="font-serif text-5xl md:text-6xl leading-tight mt-10 mb-6"
      style={{
        fontFamily: "var(--font-serif), Georgia, serif",
        color: "var(--gold)",
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      className="font-serif text-3xl md:text-4xl leading-tight mt-10 mb-4 pb-3 border-b"
      style={{
        fontFamily: "var(--font-serif), Georgia, serif",
        color: "var(--accent)",
        borderColor: "var(--border)",
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
      style={{ color: "var(--muted-foreground)" }}
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
    <strong style={{ color: "var(--gold)", fontWeight: 600 }}>
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em style={{ color: "var(--accent)", fontStyle: "italic" }}>{children}</em>
  ),
  code: ({ children }) => (
    <code
      className="font-mono text-sm px-1.5 py-0.5 rounded-sm"
      style={{
        backgroundColor: "var(--surface)",
        color: "var(--blue-cold)",
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
        borderLeft: "3px solid var(--border)",
        color: "var(--foreground)",
      }}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="my-6 pl-5 py-3 italic font-serif text-lg leading-[1.8]"
      style={{
        borderLeft: "3px solid var(--accent)",
        backgroundColor: "color-mix(in oklch, var(--surface) 80%, transparent)",
        color: "var(--foreground)",
        fontFamily: "var(--font-serif), Georgia, serif",
      }}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul
      className="font-sans text-base leading-[1.8] mb-4 pl-6 list-none space-y-1"
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
      className="relative pl-4 before:absolute before:left-0 before:content-['—'] before:opacity-40"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </li>
  ),
  hr: () => (
    <hr
      className="my-10 border-none h-px"
      style={{ backgroundColor: "var(--border)" }}
    />
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table
        className="w-full text-sm font-sans border-collapse"
        style={{ borderColor: "var(--border)" }}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ backgroundColor: "var(--surface)" }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th
      className="px-4 py-2 text-left text-xs uppercase tracking-[0.1em] font-medium border"
      style={{
        borderColor: "var(--border)",
        color: "var(--muted-foreground)",
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      className="px-4 py-2 border"
      style={{
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr
      className="hover:bg-surface/50 transition-colors"
      style={{}}
    >
      {children}
    </tr>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="underline underline-offset-2 transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
      style={{ color: "var(--accent)", outlineColor: "var(--accent)" }}
    >
      {children}
    </a>
  ),
}
