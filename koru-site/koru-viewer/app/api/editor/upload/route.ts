import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
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
