import { NextResponse } from 'next/server'
import { isGitHubConfigured } from './github-writer'

/**
 * Bloqueia operações de escrita em produção quando não há fallback de
 * persistência configurado (GitHub API). Rotas que já têm fallback explícito
 * devem chamar `blockInProduction({ allowGitHub: true })` para permitir o
 * fluxo GitHub-backed.
 */
export function blockInProduction(opts?: { allowGitHub?: boolean }) {
  if (process.env.NODE_ENV !== 'production') return null

  if (opts?.allowGitHub && isGitHubConfigured()) return null

  return NextResponse.json(
    { error: 'Esta operação só funciona no ambiente local de edição.' },
    { status: 503 },
  )
}
