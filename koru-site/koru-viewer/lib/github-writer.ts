/**
 * Grava arquivos de conteúdo via GitHub Contents API.
 *
 * Em produção (Vercel), o filesystem é read-only. Quando as envs do GitHub
 * estão configuradas, as rotas de escrita podem commitar diretamente no
 * repositório — o commit dispara um redeploy automático na Vercel.
 *
 * Envs esperadas:
 *   GITHUB_TOKEN           Personal Access Token com scope `repo`
 *   GITHUB_OWNER           dono do repo (ex.: "thaisteofilo-crypto")
 *   GITHUB_REPO            nome do repo (ex.: "Worldbuilding")
 *   GITHUB_BRANCH          branch alvo (default: "main")
 *   GITHUB_CONTENT_PREFIX  prefixo do content dentro do repo
 *                          (default: "koru-site/koru-viewer/content")
 */

const API = "https://api.github.com"

export interface GitHubConfig {
  token: string
  owner: string
  repo: string
  branch: string
  contentPrefix: string
}

export function getGitHubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  if (!token || !owner || !repo) return null
  return {
    token,
    owner,
    repo,
    branch: process.env.GITHUB_BRANCH || "main",
    contentPrefix:
      process.env.GITHUB_CONTENT_PREFIX || "koru-site/koru-viewer/content",
  }
}

export function isGitHubConfigured(): boolean {
  return getGitHubConfig() !== null
}

function headers(cfg: GitHubConfig): HeadersInit {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
}

function repoPath(cfg: GitHubConfig, relPath: string): string {
  const clean = relPath.replace(/^\/+/, "")
  return `${cfg.contentPrefix}/${clean}`
}

interface GhFileInfo {
  path: string
  sha: string
}

/**
 * Retorna o caminho real do arquivo no repo (tentando match por prefixo se o
 * exato não existir) e o sha do blob atual. Retorna null se nada bater.
 */
export async function resolveFile(
  relPath: string,
): Promise<GhFileInfo | null> {
  const cfg = getGitHubConfig()
  if (!cfg) return null

  const exact = repoPath(cfg, relPath)
  const exactRes = await fetch(
    `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(exact)}?ref=${encodeURIComponent(cfg.branch)}`,
    { headers: headers(cfg), cache: "no-store" },
  )
  if (exactRes.ok) {
    const data = (await exactRes.json()) as { sha: string; path: string }
    return { path: data.path, sha: data.sha }
  }

  // Match por prefixo (ex.: biblia/parte-01 → biblia/parte-01-titulo.md)
  const lastSlash = relPath.lastIndexOf("/")
  const dir = lastSlash >= 0 ? relPath.slice(0, lastSlash) : ""
  const base = relPath.slice(lastSlash + 1).replace(/\.md$/, "")

  const dirUrl = `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(
    repoPath(cfg, dir),
  )}?ref=${encodeURIComponent(cfg.branch)}`
  const dirRes = await fetch(dirUrl, { headers: headers(cfg), cache: "no-store" })
  if (!dirRes.ok) return null

  const entries = (await dirRes.json()) as Array<{
    name: string
    path: string
    sha: string
    type: string
  }>
  const match = entries.find(
    (e) => e.type === "file" && e.name.startsWith(base) && e.name.endsWith(".md"),
  )
  return match ? { path: match.path, sha: match.sha } : null
}

export async function writeContentFile(args: {
  relPath: string
  content: string
  message: string
  author?: { name: string; email: string }
}): Promise<{ ok: true; commitSha: string } | { ok: false; error: string }> {
  const cfg = getGitHubConfig()
  if (!cfg) return { ok: false, error: "GITHUB_* envs not configured" }

  // Tenta resolver arquivo existente (pega sha para update)
  const resolved = await resolveFile(args.relPath)
  const targetPath = resolved?.path ?? repoPath(cfg, args.relPath)

  const body: Record<string, unknown> = {
    message: args.message,
    content: Buffer.from(args.content, "utf-8").toString("base64"),
    branch: cfg.branch,
  }
  if (resolved?.sha) body.sha = resolved.sha
  if (args.author) body.author = args.author

  const res = await fetch(
    `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(targetPath)}`,
    {
      method: "PUT",
      headers: { ...headers(cfg), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    return { ok: false, error: `GitHub API ${res.status}: ${text.slice(0, 300)}` }
  }

  const data = (await res.json()) as { commit: { sha: string } }
  return { ok: true, commitSha: data.commit.sha }
}

export async function readContentFile(
  relPath: string,
): Promise<{ content: string; path: string } | null> {
  const resolved = await resolveFile(relPath)
  if (!resolved) return null

  const cfg = getGitHubConfig()!
  const res = await fetch(
    `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(resolved.path)}?ref=${encodeURIComponent(cfg.branch)}`,
    { headers: headers(cfg), cache: "no-store" },
  )
  if (!res.ok) return null
  const data = (await res.json()) as { content: string; encoding: string; path: string }
  const decoded = Buffer.from(data.content, "base64").toString("utf-8")
  return { content: decoded, path: data.path }
}
