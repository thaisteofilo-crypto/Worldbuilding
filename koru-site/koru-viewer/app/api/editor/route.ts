import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Same root logic as lib/content.ts
const REPO_ROOT = path.resolve(path.join(process.cwd(), '..', '..'))

const ALLOWED_PREFIXES = [
  'biblia/',
  'livro/',
  'contos/',
]

function safePath(relativePath: string): string | null {
  const normalized = path.normalize(relativePath).replace(/\\/g, '/')

  if (path.isAbsolute(normalized) || normalized.startsWith('..')) return null

  const allowed = ALLOWED_PREFIXES.some(
    (p) => normalized === p || normalized.startsWith(p)
  )
  if (!allowed) return null

  const resolved = path.resolve(REPO_ROOT, normalized)
  if (!resolved.startsWith(REPO_ROOT + path.sep) && resolved !== REPO_ROOT)
    return null

  return resolved
}

// Find file by prefix (handles biblia/parte-XX-titulo.md naming)
function findByPrefix(dir: string, prefix: string, ext: string): string | null {
  const dirPath = path.join(REPO_ROOT, dir)
  if (!fs.existsSync(dirPath)) return null

  const files = fs.readdirSync(dirPath)
  const match = files.find((f) => f.startsWith(prefix) && f.endsWith(ext))
  return match ? path.join(dirPath, match) : null
}

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get('path')

  if (!filePath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
  }

  const resolved = safePath(filePath)
  if (!resolved) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
  }

  let actualPath = resolved

  if (!fs.existsSync(actualPath)) {
    // Try prefix matching (e.g. biblia/parte-01 -> biblia/parte-01-titulo.md)
    const dir = path.dirname(filePath)
    const base = path.basename(filePath, '.md')
    const fallback = findByPrefix(dir, base, '.md')
    if (fallback) {
      actualPath = fallback
    } else {
      return NextResponse.json({ error: 'File not found', content: '' }, { status: 404 })
    }
  }

  try {
    const content = fs.readFileSync(actualPath, 'utf-8')
    return NextResponse.json({ content, resolvedPath: actualPath })
  } catch {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { path: filePath, content } = await request.json()

    if (!filePath || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing path or content' }, { status: 400 })
    }

    const resolved = safePath(filePath)
    if (!resolved) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
    }

    let actualPath = resolved

    if (!fs.existsSync(actualPath)) {
      const dir = path.dirname(filePath)
      const base = path.basename(filePath, '.md')
      const fallback = findByPrefix(dir, base, '.md')
      if (fallback) {
        actualPath = fallback
      } else {
        // Create the file if it doesn't exist
        const dirPath = path.dirname(resolved)
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true })
        }
        actualPath = resolved
      }
    }

    fs.writeFileSync(actualPath, content, 'utf-8')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }
}
