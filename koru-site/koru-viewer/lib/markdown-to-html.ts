/**
 * Minimal markdown → HTML converter, tuned for inserting into a TipTap editor.
 *
 * Escopo: headings, listas, parágrafos, bold/italic/code/link inline,
 * blocos de código (incluindo ```suggestion — o fence vira bloco de texto normal),
 * tabelas markdown ao estilo GFM.
 *
 * Não usa nenhum lib externa (marked/turndown), é um parser mínimo
 * para o que a IA produz no chat admin.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function renderInline(text: string): string {
  let out = escapeHtml(text)
  // Links [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => `<a href="${href}">${label}</a>`)
  // Bold-italic ***x***
  out = out.replace(/\*\*\*([^*]+?)\*\*\*/g, "<strong><em>$1</em></strong>")
  // Bold **x**
  out = out.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>")
  // Italic *x* (avoid matching lists/bold already handled)
  out = out.replace(/(?<![*_])\*([^*\n]+?)\*(?![*_])/g, "<em>$1</em>")
  // Italic _x_
  out = out.replace(/(?<![_\w])_([^_\n]+?)_(?![_\w])/g, "<em>$1</em>")
  // Inline code `x`
  out = out.replace(/`([^`\n]+?)`/g, "<code>$1</code>")
  return out
}

function parseTable(lines: string[], startIdx: number): { html: string; nextIdx: number } | null {
  const header = lines[startIdx]
  const sep = lines[startIdx + 1]
  if (!header?.includes("|") || !sep?.match(/^\s*\|?[-:\s|]+\|?\s*$/)) return null

  const splitRow = (row: string) =>
    row.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim())

  const headerCells = splitRow(header)
  const bodyRows: string[][] = []
  let i = startIdx + 2
  while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
    bodyRows.push(splitRow(lines[i]))
    i++
  }

  const theadHtml =
    "<thead><tr>" +
    headerCells.map((h) => `<th>${renderInline(h)}</th>`).join("") +
    "</tr></thead>"
  const tbodyHtml =
    "<tbody>" +
    bodyRows
      .map(
        (row) =>
          "<tr>" +
          row.map((c) => `<td>${renderInline(c)}</td>`).join("") +
          "</tr>"
      )
      .join("") +
    "</tbody>"

  return { html: `<table>${theadHtml}${tbodyHtml}</table>`, nextIdx: i }
}

export function markdownToHtml(source: string): string {
  const normalized = source.replace(/\r\n/g, "\n").trim()
  const lines = normalized.split("\n")
  const blocks: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    const fenceMatch = line.match(/^```(\w*)\s*$/)
    if (fenceMatch) {
      const lang = fenceMatch[1]
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        codeLines.push(lines[i])
        i++
      }
      i++ // pula o ``` final
      const codeContent = codeLines.join("\n")

      // Para blocos "suggestion" a IA usa apenas para marcar sugestões;
      // quando o usuário insere, queremos o conteúdo real como markdown (não como <pre>).
      // Então re-parseamos o conteúdo interno.
      if (lang === "suggestion" || lang === "md" || lang === "markdown" || lang === "") {
        const inner = markdownToHtml(codeContent)
        if (inner.trim()) {
          blocks.push(inner)
          continue
        }
      }

      blocks.push(`<pre><code>${escapeHtml(codeContent)}</code></pre>`)
      continue
    }

    // Table
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      lines[i + 1].match(/^\s*\|?[-:\s|]+\|?\s*$/)
    ) {
      const parsed = parseTable(lines, i)
      if (parsed) {
        blocks.push(parsed.html)
        i = parsed.nextIdx
        continue
      }
    }

    // Headings
    const h1 = line.match(/^#\s+(.+)$/)
    if (h1) { blocks.push(`<h1>${renderInline(h1[1])}</h1>`); i++; continue }
    const h2 = line.match(/^##\s+(.+)$/)
    if (h2) { blocks.push(`<h2>${renderInline(h2[1])}</h2>`); i++; continue }
    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) { blocks.push(`<h3>${renderInline(h3[1])}</h3>`); i++; continue }
    const h4 = line.match(/^####\s+(.+)$/)
    if (h4) { blocks.push(`<h4>${renderInline(h4[1])}</h4>`); i++; continue }

    // Blockquote
    if (line.match(/^>\s?/)) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].match(/^>\s?/)) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""))
        i++
      }
      blocks.push(`<blockquote>${markdownToHtml(quoteLines.join("\n"))}</blockquote>`)
      continue
    }

    // Unordered list
    if (line.match(/^[-*+]\s+/)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^[-*+]\s+/)) {
        items.push(`<li>${renderInline(lines[i].replace(/^[-*+]\s+/, ""))}</li>`)
        i++
      }
      blocks.push(`<ul>${items.join("")}</ul>`)
      continue
    }

    // Ordered list
    if (line.match(/^\d+\.\s+/)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(`<li>${renderInline(lines[i].replace(/^\d+\.\s+/, ""))}</li>`)
        i++
      }
      blocks.push(`<ol>${items.join("")}</ol>`)
      continue
    }

    // Horizontal rule
    if (line.match(/^(---|___|\*\*\*)\s*$/)) {
      blocks.push("<hr />")
      i++
      continue
    }

    // Blank line
    if (line.trim() === "") {
      i++
      continue
    }

    // Paragraph (collect until blank line or special block)
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^```/) &&
      !lines[i].match(/^#{1,4}\s+/) &&
      !lines[i].match(/^[-*+]\s+/) &&
      !lines[i].match(/^\d+\.\s+/) &&
      !lines[i].match(/^>/) &&
      !lines[i].match(/^(---|___|\*\*\*)\s*$/) &&
      !(lines[i].includes("|") && i + 1 < lines.length && lines[i + 1].match(/^\s*\|?[-:\s|]+\|?\s*$/))
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      blocks.push(`<p>${renderInline(paraLines.join(" "))}</p>`)
    }
  }

  return blocks.join("\n")
}
