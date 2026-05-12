// Helpers de SEO usados em generateMetadata das rotas dinâmicas.

const DEFAULT_DESCRIPTION = "Um mundo cuja física é baseada em memória."

/**
 * Extrai uma descrição (até 160 chars) de um documento markdown.
 * Prioridade:
 *   1. frontmatter.description (string)
 *   2. primeiro parágrafo de texto do conteúdo, sem cabeçalhos/HRs/blockquotes,
 *      com markdown básico removido.
 *   3. fallback genérico do site.
 */
export function extractDescription(
  frontmatter: Record<string, unknown> | undefined,
  content: string,
): string {
  const fmDesc = frontmatter?.["description"]
  if (typeof fmDesc === "string" && fmDesc.trim()) {
    return truncate(fmDesc.trim(), 160)
  }

  const cleaned = firstParagraph(content)
  if (cleaned) return truncate(cleaned, 160)

  return DEFAULT_DESCRIPTION
}

function firstParagraph(content: string): string | null {
  if (!content) return null
  const lines = content.split(/\r?\n/)
  const buffer: string[] = []
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      if (buffer.length > 0) break
      continue
    }
    // pula cabeçalhos, HRs, listas, blockquotes, ênfases isoladas, comentários
    if (
      line.startsWith("#") ||
      line.startsWith("---") ||
      line.startsWith(">") ||
      line.startsWith("- ") ||
      line.startsWith("* ") ||
      line.startsWith("+ ") ||
      /^\d+\.\s/.test(line) ||
      line.startsWith("|") ||
      line.startsWith("```") ||
      line.startsWith("<!--") ||
      line.startsWith("![")
    ) {
      if (buffer.length > 0) break
      continue
    }
    buffer.push(line)
  }
  if (buffer.length === 0) return null
  return stripMarkdown(buffer.join(" "))
}

function stripMarkdown(input: string): string {
  return input
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // imagens
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/__([^_]+)__/g, "$1") // bold underline
    .replace(/_([^_]+)_/g, "$1") // italic underline
    .replace(/~~([^~]+)~~/g, "$1") // strike
    .replace(/\s+/g, " ")
    .trim()
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const slice = text.slice(0, max - 1)
  const lastSpace = slice.lastIndexOf(" ")
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice
  return cut.trimEnd() + "…"
}
