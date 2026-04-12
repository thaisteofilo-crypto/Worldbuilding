/**
 * Strips leading h1 (# ) and h2 (## ) lines from the beginning of markdown.
 * Stops as soon as it encounters a non-heading, non-empty line.
 * Use this to prevent duplicate titles when HeroBanner already shows them.
 */
export function stripLeadingHeadings(content: string): string {
  const lines = content.split("\n")
  let i = 0
  while (i < lines.length) {
    const trimmed = lines[i].trimStart()
    if (trimmed === "") {
      // skip blank lines at the top
      i++
      continue
    }
    if (trimmed.startsWith("# ") || trimmed.startsWith("## ")) {
      i++
      continue
    }
    // first non-heading, non-blank line — stop stripping
    break
  }
  return lines.slice(i).join("\n")
}

/**
 * Sanitizes markdown content for safe use with next-mdx-remote.
 * Removes patterns that MDX would try to parse as JSX.
 */
export function sanitizeForMdx(content: string): string {
  return (
    content
      // Remove heading anchors like {#parte-0} — MDX parses {} as JSX
      .replace(/\{#[^}\s]+\}/g, "")
      // Escape standalone curly braces that aren't in code blocks or fences
      // We do a line-by-line approach to skip code blocks
      .split("\n")
      .reduce(
        (acc, line) => {
          const { inCode, lines } = acc
          // Toggle code fence tracking
          if (line.trim().startsWith("```")) {
            return { inCode: !inCode, lines: [...lines, line] }
          }
          if (inCode) {
            return { inCode, lines: [...lines, line] }
          }
          // Outside code: escape { and } that aren't already escaped
          // and aren't part of inline code
          const safeLine = escapeOutsideInlineCode(line)
          return { inCode, lines: [...lines, safeLine] }
        },
        { inCode: false, lines: [] as string[] }
      ).lines.join("\n")
  )
}

function escapeOutsideInlineCode(line: string): string {
  // Split by inline code spans, escape braces only outside them
  const parts = line.split(/(`[^`]*`)/)
  return parts
    .map((part, i) => {
      // Even indices are outside inline code, odd indices are inside
      if (i % 2 === 0) {
        return part.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;")
      }
      return part
    })
    .join("")
}
