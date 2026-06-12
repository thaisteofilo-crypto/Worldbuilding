// Utilitários puros compartilhados entre server (páginas, mdx-components)
// e client (toc.tsx). Sem dependências externas.

export interface TocHeading {
  id: string
  text: string
  level: number
}

/**
 * Slug simples e estável: minúsculas, sem acentos, hífens.
 * Usado tanto para gerar ids nos headings (mdx-components)
 * quanto para extrair o sumário no server — precisa ser idêntico nos dois.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Extrai o texto puro de uma árvore de ReactNode (children de um heading).
 * Implementação recursiva sem importar React — funciona em RSC e client.
 */
export function extractText(node: unknown): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join("")
  if (typeof node === "object" && "props" in (node as object)) {
    return extractText((node as { props?: { children?: unknown } }).props?.children)
  }
  return ""
}

/** Remove formatação inline de markdown para igualar o texto renderizado. */
function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .trim()
}

/**
 * Extrai headings h2/h3 do markdown bruto (linhas `## ` / `### `),
 * ignorando blocos de código. Os ids gerados batem com os ids que
 * mdx-components atribui aos headings renderizados.
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = []
  let inCode = false

  for (const line of markdown.split("\n")) {
    if (/^(```|~~~)/.test(line.trim())) {
      inCode = !inCode
      continue
    }
    if (inCode) continue

    const m = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/)
    if (!m) continue

    const text = cleanInlineMarkdown(m[2])
    if (!text) continue
    const id = slugify(text)
    if (!id) continue

    headings.push({ id, text, level: m[1].length })
  }

  return headings
}

/** Tempo estimado de leitura: palavras ÷ 200, arredondado para cima, mínimo 1. */
export function estimateReadingMinutes(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
