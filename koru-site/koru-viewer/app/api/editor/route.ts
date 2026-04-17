import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { blockInProduction } from '@/lib/production-guard'
import { isGitHubConfigured, readContentFile, writeContentFile } from '@/lib/github-writer'

// Same root logic as lib/content.ts
const REPO_ROOT = path.resolve(path.join(process.cwd(), 'content'))

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

  // Em produção com GitHub: lê direto do repo (fresh após edições via API,
  // antes do redeploy completar).
  if (process.env.NODE_ENV === 'production' && isGitHubConfigured()) {
    try {
      const ghFile = await readContentFile(filePath)
      if (ghFile) {
        return NextResponse.json({ content: ghFile.content, resolvedPath: ghFile.path, source: 'github' })
      }
    } catch (err) {
      console.error('[editor] GET github read error:', err)
      // cai no filesystem como fallback
    }
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
  const blocked = blockInProduction({ allowGitHub: true })
  if (blocked) return blocked
  try {
    const { path: filePath, content } = await request.json()

    if (!filePath || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing path or content' }, { status: 400 })
    }

    // Validação de path (mesma regra usada no fs)
    const resolved = safePath(filePath)
    if (!resolved) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
    }

    // Em produção com GitHub configurado: commit via GitHub API.
    // O commit dispara redeploy automático na Vercel (~30s).
    if (process.env.NODE_ENV === 'production' && isGitHubConfigured()) {
      const result = await writeContentFile({
        relPath: filePath,
        content,
        message: `Edit ${filePath} via admin`,
      })
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error },
          { status: 502 },
        )
      }
      return NextResponse.json({
        success: true,
        mode: 'github',
        commitSha: result.commitSha,
        note: 'Commit criado. Vercel fará redeploy automático em ~30s.',
      })
    }

    // Caminho local: grava no filesystem diretamente.
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
    return NextResponse.json({ success: true, mode: 'local' })
  } catch (err) {
    console.error('[editor] PUT error:', err)
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }
}
