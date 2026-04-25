#!/usr/bin/env node
// Copia o conteúdo da raiz do repo (livro/, biblia/, contos/, *.md) para
// koru-site/koru-viewer/.content-mirror/ — usado em build da Vercel onde o
// rootDirectory é koru-site/koru-viewer/ e o serverless function não enxerga
// arquivos fora desse diretório.
//
// Roda como prebuild. Em dev local não é necessário (lib/content.ts lê da raiz
// real), mas rodar não machuca — o mirror só é consultado quando process.env.VERCEL
// está setada.

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VIEWER_ROOT = path.resolve(__dirname, "..")
const REPO_ROOT = path.resolve(VIEWER_ROOT, "..", "..")
const MIRROR = path.join(VIEWER_ROOT, ".content-mirror")

const DIRS = ["livro", "biblia", "contos"]
const ROOT_FILES = ["koru-ecosystem-briefing.md", "koru-workflow.md"]

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true })
}

function copyDirRecursive(src, dst) {
  if (!fs.existsSync(src)) return 0
  fs.mkdirSync(dst, { recursive: true })
  let count = 0
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dst, entry.name)
    if (entry.isDirectory()) {
      count += copyDirRecursive(s, d)
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      fs.copyFileSync(s, d)
      count++
    }
  }
  return count
}

console.log("[copy-content] mirror:", MIRROR)
rmrf(MIRROR)
fs.mkdirSync(MIRROR, { recursive: true })

let total = 0
for (const d of DIRS) {
  const c = copyDirRecursive(path.join(REPO_ROOT, d), path.join(MIRROR, d))
  console.log(`[copy-content] ${d}/: ${c} arquivos`)
  total += c
}
for (const f of ROOT_FILES) {
  const src = path.join(REPO_ROOT, f)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(MIRROR, f))
    console.log(`[copy-content] ${f}: copiado`)
    total++
  }
}

console.log(`[copy-content] total: ${total} arquivos no mirror.`)
