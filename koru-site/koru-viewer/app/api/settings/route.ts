import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { blockInProduction } from '@/lib/production-guard'

export const runtime = 'nodejs'

const ENV_FILE = path.resolve(process.cwd(), '.env.local')

// Cache the .env.local presence check. POST invalidates it on save.
const ENV_CHECK_TTL = 30 * 1000
let envCheckCache: { anthropic: boolean; gemma: boolean; timestamp: number } | null = null

const GEMMA_ENV_KEYS = ['GOOGLE_API_KEY', 'GEMINI_API_KEY', 'GEMMA_API_KEY']

function checkEnvFileForKeys(): { anthropic: boolean; gemma: boolean } {
  const now = Date.now()
  if (envCheckCache && now - envCheckCache.timestamp < ENV_CHECK_TTL) {
    return { anthropic: envCheckCache.anthropic, gemma: envCheckCache.gemma }
  }
  let anthropic = false
  let gemma = false
  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf-8')
    anthropic = /^ANTHROPIC_API_KEY=/m.test(content)
    gemma = GEMMA_ENV_KEYS.some((k) => new RegExp(`^${k}=`, 'm').test(content))
  }
  envCheckCache = { anthropic, gemma, timestamp: now }
  return { anthropic, gemma }
}

function envHasGemma(): boolean {
  return GEMMA_ENV_KEYS.some((k) => !!process.env[k])
}

export async function GET() {
  try {
    const file = checkEnvFileForKeys()
    const anthropic = !!process.env.ANTHROPIC_API_KEY || file.anthropic
    const gemma = envHasGemma() || file.gemma
    return NextResponse.json(
      {
        // legacy field, mantido para compat
        configured: anthropic,
        anthropic,
        gemma,
      },
      { headers: { 'Cache-Control': 'private, max-age=15' } },
    )
  } catch {
    return NextResponse.json({ configured: false, anthropic: false, gemma: false })
  }
}

interface SaveBody {
  apiKey?: string
  provider?: 'anthropic' | 'gemma'
}

export async function POST(request: Request) {
  const blocked = blockInProduction()
  if (blocked) return blocked
  try {
    const body = (await request.json()) as SaveBody
    const apiKey = body.apiKey
    const provider = body.provider ?? 'anthropic'

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 })
    }

    let envKeyName: string
    if (provider === 'anthropic') {
      if (!apiKey.startsWith('sk-ant-')) {
        return NextResponse.json({ error: 'Chave Anthropic inválida. Deve começar com sk-ant-.' }, { status: 400 })
      }
      envKeyName = 'ANTHROPIC_API_KEY'
    } else if (provider === 'gemma') {
      // Google AI Studio keys começam com AIza e têm ~39 chars.
      if (!/^AIza[0-9A-Za-z_-]{20,}$/.test(apiKey)) {
        return NextResponse.json({ error: 'Chave Gemma/Google inválida. Pegue em aistudio.google.com/apikey (formato AIza...).' }, { status: 400 })
      }
      envKeyName = 'GOOGLE_API_KEY'
    } else {
      return NextResponse.json({ error: 'provider inválido (use anthropic ou gemma).' }, { status: 400 })
    }

    let existingContent = ''
    if (fs.existsSync(ENV_FILE)) {
      existingContent = fs.readFileSync(ENV_FILE, 'utf-8')
    }

    const keyLine = `${envKeyName}=${apiKey}`
    const pattern = new RegExp(`^${envKeyName}=.*$`, 'm')
    if (pattern.test(existingContent)) {
      existingContent = existingContent.replace(pattern, keyLine)
    } else {
      existingContent = existingContent.trim()
      existingContent = existingContent ? `${existingContent}\n${keyLine}\n` : `${keyLine}\n`
    }

    fs.writeFileSync(ENV_FILE, existingContent, 'utf-8')
    envCheckCache = null

    return NextResponse.json({
      success: true,
      message: `Chave ${provider} salva. Reinicie o servidor para ativar.`,
    })
  } catch {
    return NextResponse.json({ error: 'Falha ao salvar a chave.' }, { status: 500 })
  }
}
