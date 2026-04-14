import fs from "fs"
import path from "path"
import matter from "gray-matter"

// Root of the worldbuilding project (two levels up from koru-site/koru-viewer)
const REPO_ROOT = path.resolve(path.join(process.cwd(), "..", ".."))

const ALLOWED_PREFIXES = [
  "biblia/",
  "livro/",
  "contos/",
  "koru-ecosystem-briefing.md",
  "koru-workflow.md",
]

export interface DocContent {
  title: string
  content: string
  frontmatter: Record<string, unknown>
}

function safePath(relativePath: string): string | null {
  const normalized = path.normalize(relativePath).replace(/\\/g, "/")

  if (path.isAbsolute(normalized) || normalized.startsWith("..")) return null

  const allowed = ALLOWED_PREFIXES.some(
    (p) => normalized === p || normalized.startsWith(p)
  )
  if (!allowed) return null

  const resolved = path.resolve(REPO_ROOT, normalized)
  if (!resolved.startsWith(REPO_ROOT + path.sep) && resolved !== REPO_ROOT)
    return null

  return resolved
}

// Handles biblia/parte-XX-titulo.md naming — finds file by prefix
function findByPrefix(dir: string, prefix: string, ext: string): string | null {
  const dirPath = path.join(REPO_ROOT, dir)
  if (!fs.existsSync(dirPath)) return null

  const files = fs.readdirSync(dirPath)
  const match = files.find((f) => f.startsWith(prefix) && f.endsWith(ext))
  return match ? path.join(dirPath, match) : null
}

export function readMarkdown(relativePath: string): DocContent {
  const filePath = safePath(relativePath)

  if (!filePath) {
    return {
      title: "Acesso negado",
      content: "Caminho inválido.",
      frontmatter: {},
    }
  }

  let resolvedPath = filePath

  if (!fs.existsSync(resolvedPath)) {
    const dir = path.dirname(relativePath)
    const base = path.basename(relativePath, ".md")
    const fallback = findByPrefix(dir, base, ".md")

    if (!fallback) {
      return {
        title: "Documento não encontrado",
        content: `O arquivo \`${relativePath}\` ainda não existe.`,
        frontmatter: {},
      }
    }
    resolvedPath = fallback
  }

  let raw: string
  try {
    raw = fs.readFileSync(resolvedPath, "utf-8")
  } catch {
    return {
      title: "Erro de leitura",
      content: `Não foi possível ler o arquivo \`${relativePath}\`.`,
      frontmatter: {},
    }
  }
  const { data, content } = matter(raw)

  const title =
    typeof data.title === "string"
      ? data.title
      : extractTitleFromContent(content) ?? relativePath

  return { title, content, frontmatter: data }
}

function extractTitleFromContent(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

// Known biblia titles for display (manual curation for existing parts)
const KNOWN_BIBLIA_TITLES: Record<string, string> = {
  "parte-00": "Introdução",
  "parte-01": "Física e Cosmologia",
  "parte-02": "Geografia",
  "parte-03": "Ecossistema",
  "parte-04": "Criaturas",
  "parte-05": "Personagens",
  "parte-06": "Regras",
  "parte-07": "Cultura",
  "parte-08": "Linha do Tempo",
}

export function bibliaParts(): { parte: string }[] {
  const bibliaDir = path.join(REPO_ROOT, "biblia")
  if (!fs.existsSync(bibliaDir)) return []
  const files = fs.readdirSync(bibliaDir)
  const parts = files
    .filter((f) => /^parte-\d+/.test(f) && f.endsWith(".md"))
    .map((f) => { const m = f.match(/^parte-(\d+)/); return m ? m[1] : null })
    .filter((p): p is string => p !== null)
    .sort((a, b) => parseInt(a) - parseInt(b))
  return parts.map((n) => ({ parte: n }))
}

export function livroChapters(): { capitulo: string }[] {
  const livroDir = path.join(REPO_ROOT, "livro")
  if (!fs.existsSync(livroDir)) return []
  const files = fs.readdirSync(livroDir)
  const chapters = files
    .filter((f) => /^capitulo-\d+/.test(f) && f.endsWith(".md"))
    .map((f) => f.match(/^capitulo-(\d+)/)?.[1])
    .filter((c): c is string => c !== undefined)
    .sort((a, b) => parseInt(a) - parseInt(b))
  const hasEpilogo = files.includes("epilogo.md")
  const slugs = hasEpilogo ? [...chapters, "epilogo"] : chapters
  return slugs.map((s) => ({ capitulo: s }))
}

export function contoSlugs(): { personagem: string }[] {
  const contosDir = path.join(REPO_ROOT, "contos")
  if (!fs.existsSync(contosDir)) return []
  const files = fs.readdirSync(contosDir)
  return files
    .filter((f) => /^conto-/.test(f) && f.endsWith(".md"))
    .map((f) => f.replace(/^conto-/, "").replace(/\.md$/, ""))
    .sort()
    .map((s) => ({ personagem: s }))
}

// Nav item helpers — used by server components (sidebar, doc nav, home page)
export function getBibliaItems(): { slug: string; title: string }[] {
  const bibliaDir = path.join(REPO_ROOT, "biblia")
  const files = fs.existsSync(bibliaDir) ? fs.readdirSync(bibliaDir) : []
  return bibliaParts().map(({ parte }) => {
    const slug = `parte-${parte}`
    if (KNOWN_BIBLIA_TITLES[slug]) return { slug, title: KNOWN_BIBLIA_TITLES[slug] }
    // Extract title from filename suffix: "parte-09-nova-parte.md" → "Nova Parte"
    const file = files.find((f) => f.startsWith(slug) && f.endsWith(".md"))
    if (file) {
      const suffix = file.slice(slug.length).replace(/^[-_]/, "").replace(".md", "")
      if (suffix) {
        const title = suffix.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        return { slug, title }
      }
    }
    return { slug, title: `Parte ${parseInt(parte)}` }
  })
}

export function getLivroItems(): { slug: string; title: string }[] {
  return livroChapters().map(({ capitulo }) => ({
    slug: capitulo,
    title: capitulo === "epilogo" ? "Epílogo" : `Capítulo ${parseInt(capitulo)}`,
  }))
}

export function getContosItems(): { slug: string; title: string }[] {
  return contoSlugs().map(({ personagem }) => ({
    slug: personagem,
    title: personagem.charAt(0).toUpperCase() + personagem.slice(1),
  }))
}
