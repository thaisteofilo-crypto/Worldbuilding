import { NextResponse } from 'next/server'

/**
 * Endpoint público de diagnóstico. Reporta apenas presença de envs
 * (nunca valores sensíveis) e se o token consegue autenticar no GitHub.
 *
 * Remover quando o setup GitHub-backed estiver estável.
 */
export async function GET() {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'

  const envs = {
    NODE_ENV: process.env.NODE_ENV,
    hasToken: !!token,
    tokenPrefix: token ? token.slice(0, 4) : null,
    tokenLen: token ? token.length : 0,
    owner: owner || null,
    repo: repo || null,
    branch,
  }

  if (!token) {
    return NextResponse.json({ ...envs, githubAuth: 'skipped (no token)' })
  }

  // Testa autenticação no GitHub
  try {
    const r = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
      cache: 'no-store',
    })
    if (!r.ok) {
      return NextResponse.json({
        ...envs,
        githubAuth: 'failed',
        githubStatus: r.status,
        githubError: (await r.text()).slice(0, 200),
      })
    }
    const user = (await r.json()) as { login: string }

    // Testa acesso ao repo (read)
    let repoAccess: 'ok' | 'failed' | 'skipped' = 'skipped'
    let repoStatus: number | null = null
    if (owner && repo) {
      const rr = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
          cache: 'no-store',
        },
      )
      repoStatus = rr.status
      repoAccess = rr.ok ? 'ok' : 'failed'
    }

    return NextResponse.json({
      ...envs,
      githubAuth: 'ok',
      githubUser: user.login,
      repoAccess,
      repoStatus,
    })
  } catch (err) {
    return NextResponse.json({
      ...envs,
      githubAuth: 'error',
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
