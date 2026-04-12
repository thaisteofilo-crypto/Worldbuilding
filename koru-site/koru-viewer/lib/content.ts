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

  const raw = fs.readFileSync(resolvedPath, "utf-8")
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

export function bibliaParts() {
  return [
    "00",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
  ].map((n) => ({ parte: n }))
}

export function livroChapters() {
  return ["01", "02", "03", "04", "05", "06", "epilogo"].map((s) => ({
    capitulo: s,
  }))
}

export function contoSlugs() {
  return ["temiku", "amara", "oruku", "beku", "obaru", "kemdi", "orike"].map(
    (s) => ({ personagem: s })
  )
}
