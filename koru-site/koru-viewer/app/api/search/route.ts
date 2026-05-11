import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

export const runtime = "nodejs"

const REPO_ROOT = path.resolve(path.join(process.cwd(), "content"))
const EXCERPT_RADIUS = 150
const MAX_RESULTS = 20

// Cache file contents + parsed frontmatter for 60s. Search is invoked on every
// keystroke (debounced by client), so the same ~25 files would otherwise be
// read+parsed dozens of times per minute. Keep TTL short so edits show up fast.
const FILE_CACHE_TTL = 60 * 1000
type CachedFile = { content: string; data: Record<string, unknown>; mtimeMs: number }
const fileCache = new Map<string, { entry: CachedFile; timestamp: number }>()

export interface SearchResult {
  title: string
  section: string
  slug: string
  url: string
  excerpt: string
  matchCount: number
}

function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch {
    return null
  }
}

function readParsedFile(filePath: string): CachedFile | null {
  const now = Date.now()
  const cached = fileCache.get(filePath)
  if (cached && now - cached.timestamp < FILE_CACHE_TTL) {
    return cached.entry
  }
  const raw = readFile(filePath)
  if (!raw) return null
  const { data, content } = matter(raw)
  const entry: CachedFile = { content, data: data as Record<string, unknown>, mtimeMs: now }
  fileCache.set(filePath, { entry, timestamp: now })
  return entry
}

function findFileByPrefix(dir: string, prefix: string): string | null {
  if (!fs.existsSync(dir)) return null
  const files = fs.readdirSync(dir)
  const match = files.find((f) => f.startsWith(prefix) && f.endsWith(".md"))
  return match ? path.join(dir, match) : null
}

function extractTitle(content: string, frontmatter: Record<string, unknown>, fallback: string): string {
  if (typeof frontmatter.title === "string") return frontmatter.title
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : fallback
}

function buildExcerpt(content: string, query: string): string {
  const lower = content.toLowerCase()
  const queryLower = query.toLowerCase()
  const idx = lower.indexOf(queryLower)
  if (idx === -1) return content.slice(0, EXCERPT_RADIUS * 2).replace(/\n+/g, " ").trim()

  const start = Math.max(0, idx - EXCERPT_RADIUS)
  const end = Math.min(content.length, idx + query.length + EXCERPT_RADIUS)
  let excerpt = content.slice(start, end).replace(/\n+/g, " ").trim()

  if (start > 0) excerpt = "..." + excerpt
  if (end < content.length) excerpt = excerpt + "..."

  return excerpt
}

function countMatches(content: string, query: string): number {
  const lower = content.toLowerCase()
  const queryLower = query.toLowerCase()
  let count = 0
  let pos = 0
  while ((pos = lower.indexOf(queryLower, pos)) !== -1) {
    count++
    pos += queryLower.length
  }
  return count
}

function searchDoc(
  filePath: string,
  query: string,
  title: string,
  section: string,
  slug: string,
  url: string
): SearchResult | null {
  const parsed = readParsedFile(filePath)
  if (!parsed) return null

  const { data, content } = parsed
  const docTitle = extractTitle(content, data, title)
  const matchCount = countMatches(content, query)
  if (matchCount === 0) return null

  const excerpt = buildExcerpt(content, query)

  return { title: docTitle, section, slug, url, excerpt, matchCount }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") ?? "").trim()

  if (q.length < 2) {
    return NextResponse.json([])
  }

  const results: SearchResult[] = []

  // ── Bíblia ────────────────────────────────────────────────────────────────
  const bibliaDir = path.join(REPO_ROOT, "biblia")
  if (fs.existsSync(bibliaDir)) {
    const files = fs.readdirSync(bibliaDir)
    const partFiles = files.filter((f) => /^parte-\d+/.test(f) && f.endsWith(".md"))

    for (const file of partFiles) {
      const match = file.match(/^parte-(\d+)/)
      if (!match) continue
      const num = match[1]
      const slug = `parte-${num}`
      const filePath = path.join(bibliaDir, file)
      // Derive display title from suffix: "parte-01-fisica.md" → "Física"
      const suffix = file
        .slice(slug.length)
        .replace(/^[-_]/, "")
        .replace(".md", "")
      const displayTitle = suffix
        ? suffix.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : `Parte ${parseInt(num)}`

      const result = searchDoc(filePath, q, displayTitle, "Bíblia", slug, `/biblia/${slug}`)
      if (result) results.push(result)
    }
  }

  // ── Livro ─────────────────────────────────────────────────────────────────
  const livroDir = path.join(REPO_ROOT, "livro")
  if (fs.existsSync(livroDir)) {
    const files = fs.readdirSync(livroDir)
    const chapFiles = files.filter((f) => /^capitulo-\d+/.test(f) && f.endsWith(".md"))

    for (const file of chapFiles) {
      const match = file.match(/^capitulo-(\d+)/)
      if (!match) continue
      const num = match[1]
      const slug = num
      const filePath = path.join(livroDir, file)
      const displayTitle = `Capítulo ${parseInt(num)}`

      const result = searchDoc(filePath, q, displayTitle, "Livro", slug, `/livro/${slug}`)
      if (result) results.push(result)
    }

    // Epílogo
    const epilogoPath = path.join(livroDir, "epilogo.md")
    if (fs.existsSync(epilogoPath)) {
      const result = searchDoc(epilogoPath, q, "Epílogo", "Livro", "epilogo", `/livro/epilogo`)
      if (result) results.push(result)
    }
  }

  // ── Contos ────────────────────────────────────────────────────────────────
  const contosDir = path.join(REPO_ROOT, "contos")
  if (fs.existsSync(contosDir)) {
    const files = fs.readdirSync(contosDir)
    const contoFiles = files.filter((f) => /^conto-/.test(f) && f.endsWith(".md"))

    for (const file of contoFiles) {
      const personagem = file.replace(/^conto-/, "").replace(/\.md$/, "")
      const slug = personagem
      const filePath = path.join(contosDir, file)
      const displayTitle = personagem.charAt(0).toUpperCase() + personagem.slice(1)

      const result = searchDoc(filePath, q, displayTitle, "Contos", slug, `/contos/${slug}`)
      if (result) results.push(result)
    }
  }

  // ── Ordenar e limitar ─────────────────────────────────────────────────────
  results.sort((a, b) => b.matchCount - a.matchCount)

  return NextResponse.json(results.slice(0, MAX_RESULTS))
}
