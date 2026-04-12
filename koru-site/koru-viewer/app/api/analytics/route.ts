import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const admin = createAdminClient()

  const [docsRes, tasksRes, charsRes, bannersRes, galleryRes] = await Promise.all([
    admin.from("documents").select("id, slug, title, section, content, updated_at"),
    admin.from("tasks").select("*"),
    admin.from("characters").select("*"),
    admin.storage.from("banners").list(""),
    admin.storage.from("gallery").list(""),
  ])

  const docs = docsRes.data ?? []
  const tasks = tasksRes.data ?? []
  const chars = charsRes.data ?? []
  const bannerFiles = bannersRes.data ?? []
  const galleryFiles = galleryRes.data ?? []

  // Word counts per section
  const wordCounts: Record<string, number> = {}
  let totalWords = 0
  for (const doc of docs) {
    const count = (doc.content ?? "").split(/\s+/).filter(Boolean).length
    wordCounts[doc.slug] = count
    totalWords += count
  }

  // Section word totals
  const sectionWords: Record<string, number> = {}
  for (const doc of docs) {
    const section = doc.section
    if (!sectionWords[section]) sectionWords[section] = 0
    sectionWords[section] += wordCounts[doc.slug] ?? 0
  }

  // Chapter data for story arc (livro section)
  const chapters = docs
    .filter((d) => d.section === "livro")
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((d) => {
      const content = d.content ?? ""
      const words = content.split(/\s+/).filter(Boolean).length
      // Dialogue density (lines with quotes or dashes)
      const lines = content.split("\n")
      const dialogueLines = lines.filter((l) =>
        /[""\u2014\u2013—–]/.test(l) || /^[-–—]/.test(l.trim())
      ).length
      // Paragraph count
      const paragraphs = content.split(/\n\s*\n/).filter(Boolean).length
      // Average sentence length (rough)
      const sentences = content.split(/[.!?]+/).filter(Boolean).length
      const avgSentenceLen = sentences > 0 ? Math.round(words / sentences) : 0
      // Tension keywords (physical/emotional intensity markers)
      const tensionWords = (content.match(/\b(endurec|dissolv|escur|dor|medo|silêncio|trevas|fogo|quebr|grit|choqu|impacto|perigo|morte|sangue|luz|brilh|explo|arden|feri|corr|fug|queda|ruptura|fratur|colapso|tremor|impuls|despert|emergiu|violên)/gi) ?? []).length
      // Tension score normalized (per 1000 words)
      const tensionScore = words > 0 ? Math.round((tensionWords / words) * 1000) : 0

      return {
        slug: d.slug,
        title: d.title,
        words,
        dialogueLines,
        totalLines: lines.length,
        paragraphs,
        avgSentenceLen,
        tensionScore,
      }
    })

  // Character mentions in livro
  const charNames = chars.map((c) => c.name?.toLowerCase()).filter(Boolean)
  const charMentions: Record<string, Record<string, number>> = {}
  for (const ch of chapters) {
    const doc = docs.find((d) => d.slug === ch.slug)
    if (!doc?.content) continue
    const lower = doc.content.toLowerCase()
    for (const name of charNames) {
      if (!name) continue
      const regex = new RegExp(name, "gi")
      const count = (lower.match(regex) ?? []).length
      if (count > 0) {
        if (!charMentions[ch.slug]) charMentions[ch.slug] = {}
        charMentions[ch.slug][name] = count
      }
    }
  }

  // Task stats
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    highPriority: tasks.filter((t) => t.priority === "high" && t.status !== "done").length,
    byCategory: {} as Record<string, number>,
  }
  for (const t of tasks) {
    taskStats.byCategory[t.category] = (taskStats.byCategory[t.category] ?? 0) + 1
  }

  // Contos status
  const contoSlugs = ["amara", "oruku", "beku", "obaru", "kemdi", "temi", "orike"]
  const contosWritten = docs.filter((d) => d.section === "contos" && (wordCounts[d.slug] ?? 0) > 200).length

  // Completion metrics
  const bibliaComplete = docs.filter((d) => d.section === "biblia").length
  const livroChapters = docs.filter((d) => d.section === "livro").length

  return NextResponse.json({
    totalWords,
    sectionWords,
    wordCounts,
    chapters,
    charMentions,
    taskStats,
    contosWritten,
    totalContos: contoSlugs.length,
    bibliaComplete,
    livroChapters,
    totalDocuments: docs.length,
    totalCharacters: chars.length,
    totalBanners: bannerFiles.filter((f) => !f.name.startsWith(".")).length,
    totalGallery: galleryFiles.filter((f) => !f.name.startsWith(".")).length,
  })
}
