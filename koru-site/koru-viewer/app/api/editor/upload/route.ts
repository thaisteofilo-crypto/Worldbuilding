import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import { blockInProduction } from '@/lib/production-guard'

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media')

// Limites e schema do upload do editor (mídia inserida no documento).
// Aceita imagens e vídeo: 50 MB é o teto para clipes curtos em qualidade
// razoável; imagens devem ficar muito abaixo disso na prática.
const MAX_MEDIA_BYTES = 50 * 1024 * 1024 // 50 MB

const ALLOWED_MEDIA_MIMETYPES = new Set([
  // Imagens
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Vídeo
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

const ALLOWED_MEDIA_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
  'mp4', 'webm', 'mov',
])

const mediaUploadSchema = z.object({
  name: z.string().min(1, 'Nome do arquivo obrigatório'),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_MEDIA_BYTES, 'Arquivo excede 50 MB'),
  type: z.string().refine(
    (t) => ALLOWED_MEDIA_MIMETYPES.has(t),
    'Tipo de mídia não permitido'
  ),
})

export async function POST(request: NextRequest) {
  const blocked = blockInProduction()
  if (blocked) return blocked
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validação de tamanho: 413 explícito.
    if (file.size > MAX_MEDIA_BYTES) {
      return NextResponse.json(
        { error: 'Arquivo excede 50 MB', maxBytes: MAX_MEDIA_BYTES },
        { status: 413 }
      )
    }

    // Validação Zod do mimetype + checagem por extensão.
    const parsed = mediaUploadSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    })
    const extName = (path.extname(file.name).slice(1) || '').toLowerCase()
    if (!parsed.success || !ALLOWED_MEDIA_EXTENSIONS.has(extName)) {
      return NextResponse.json(
        {
          error: 'Arquivo inválido',
          details: parsed.success
            ? 'Extensão não permitida'
            : parsed.error.issues.map((i) => i.message).join('; '),
        },
        { status: 400 }
      )
    }

    // Ensure media directory exists
    if (!fs.existsSync(MEDIA_DIR)) {
      fs.mkdirSync(MEDIA_DIR, { recursive: true })
    }

    // Sanitize filename
    const ext = path.extname(file.name).toLowerCase()
    const baseName = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase()
    const timestamp = Date.now()
    const fileName = `${baseName}-${timestamp}${ext}`

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(MEDIA_DIR, fileName)
    fs.writeFileSync(filePath, buffer)

    // Return the public URL path
    const url = `/media/${fileName}`

    return NextResponse.json({ url, fileName })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
