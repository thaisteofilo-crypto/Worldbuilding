import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ENV_FILE = path.resolve(process.cwd(), '.env.local')

export async function GET() {
  try {
    const hasKey = !!process.env.ANTHROPIC_API_KEY
    let fileHasKey = false

    if (fs.existsSync(ENV_FILE)) {
      const content = fs.readFileSync(ENV_FILE, 'utf-8')
      fileHasKey = content.includes('ANTHROPIC_API_KEY=')
    }

    return NextResponse.json({ configured: hasKey || fileHasKey })
  } catch {
    return NextResponse.json({ configured: false })
  }
}

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 })
    }

    if (!apiKey.startsWith('sk-ant-')) {
      return NextResponse.json({ error: 'Invalid API key format. Must start with sk-ant-' }, { status: 400 })
    }

    let existingContent = ''
    if (fs.existsSync(ENV_FILE)) {
      existingContent = fs.readFileSync(ENV_FILE, 'utf-8')
    }

    // Replace existing key or append
    const keyLine = `ANTHROPIC_API_KEY=${apiKey}`
    if (existingContent.includes('ANTHROPIC_API_KEY=')) {
      existingContent = existingContent.replace(/ANTHROPIC_API_KEY=.*/g, keyLine)
    } else {
      existingContent = existingContent.trim()
      existingContent = existingContent ? `${existingContent}\n${keyLine}\n` : `${keyLine}\n`
    }

    fs.writeFileSync(ENV_FILE, existingContent, 'utf-8')

    return NextResponse.json({ success: true, message: 'API key saved. Restart the server for changes to take effect.' })
  } catch {
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 })
  }
}
