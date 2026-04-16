import { NextResponse } from "next/server"
import { getBibliaItems, getLivroItems, getContosItems } from "@/lib/content"
import { getSiteContent } from "@/lib/site-content"
import { characterOrder, characters } from "@/lib/characters"

interface DocEntry { label: string; path: string }
interface DocGroup { section: string; color: string; docs: DocEntry[] }

// Returns merged nav items: filesystem (files on disk) + editor.doc_groups (added via editor)
// This endpoint is always dynamic — called fresh on every request
export const dynamic = "force-dynamic"

export async function GET() {
  // 1. Filesystem scan — files that already exist on disk
  const fsBiblia: DocEntry[] = getBibliaItems().map((item) => ({
    label: item.title,
    path: `biblia/${item.slug}.md`,
  }))
  const fsLivro: DocEntry[] = getLivroItems().map((item) => ({
    label: item.title,
    path: item.slug === "epilogo" ? "livro/epilogo.md" : `livro/capitulo-${item.slug}.md`,
  }))
  const fsContos: DocEntry[] = getContosItems().map((item) => ({
    label: item.title,
    path: `contos/conto-${item.slug}.md`,
  }))

  let finalBiblia = fsBiblia
  let finalLivro = fsLivro
  let finalContos = fsContos
  let excludedPaths: string[] = []

  try {
    const siteContent = await getSiteContent()

    // Excluded paths — docs the user explicitly removed from the editor
    const excludedRaw = siteContent["editor.excluded_paths"]
    if (excludedRaw) {
      excludedPaths = JSON.parse(excludedRaw) as string[]
    }
    const excluded = new Set(excludedPaths)

    // Remove excluded items from filesystem results
    finalBiblia = fsBiblia.filter((d) => !excluded.has(d.path))
    finalLivro = fsLivro.filter((d) => !excluded.has(d.path))
    finalContos = fsContos.filter((d) => !excluded.has(d.path))

    // Editor.doc_groups — label overrides + entries added before file exists on disk
    const raw = siteContent["editor.doc_groups"]
    if (raw) {
      const groups = JSON.parse(raw) as DocGroup[]

      const editorBiblia = groups.find((g) => g.section === "Bíblia")?.docs ?? []
      const editorLivro = groups.find((g) => g.section === "Livro")?.docs ?? []
      const editorContos = groups.find((g) => g.section === "Contos")?.docs ?? []

      // Build label override maps: editor label wins over filesystem-derived label
      const bibliaLabels = new Map(editorBiblia.map((d) => [d.path, d.label]))
      const livroLabels = new Map(editorLivro.map((d) => [d.path, d.label]))
      const contosLabels = new Map(editorContos.map((d) => [d.path, d.label]))

      const fsBibliaPaths = new Set(finalBiblia.map((d) => d.path))
      const fsLivroPaths = new Set(finalLivro.map((d) => d.path))
      const fsContosPaths = new Set(finalContos.map((d) => d.path))

      // Filesystem titles always win — editor labels only apply to entries that don't exist on disk
      // (label overrides from editor are legacy and may be stale)

      // Append editor-only extras (not yet on disk, not excluded)
      const extraBiblia = editorBiblia.filter((d) => !fsBibliaPaths.has(d.path) && !excluded.has(d.path))
      const extraLivro = editorLivro.filter((d) => !fsLivroPaths.has(d.path) && !excluded.has(d.path))
      const extraContos = editorContos.filter((d) => !fsContosPaths.has(d.path) && !excluded.has(d.path))

      if (extraBiblia.length) finalBiblia = [...finalBiblia, ...extraBiblia]
      if (extraLivro.length) finalLivro = [...finalLivro, ...extraLivro]
      if (extraContos.length) finalContos = [...finalContos, ...extraContos]
    }
  } catch { /* ignore — fall back to filesystem only */ }

  const groups: DocGroup[] = [
    { section: "Bíblia", color: "var(--gold)", docs: finalBiblia },
    { section: "Livro", color: "var(--accent)", docs: finalLivro },
    { section: "Contos", color: "var(--blue-cold)", docs: finalContos },
  ]

  const personagens = characterOrder.map((k) => ({ slug: k, title: characters[k].name }))

  return NextResponse.json({ groups, personagens, excludedPaths })
}
