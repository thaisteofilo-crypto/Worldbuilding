import { NextResponse } from "next/server"
import { readMarkdown, livroChapters, contoSlugs, bibliaParts } from "@/lib/content"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  // ─── Read chapters from filesystem ───
  const chapterSlugs = livroChapters()
  const chapters = chapterSlugs.map(({ capitulo }) => {
    const slug = capitulo === "epilogo" ? "epilogo" : `capitulo-${capitulo}`
    const doc = readMarkdown(`livro/${slug}.md`)
    const content = doc.content ?? ""
    const words = content.split(/\s+/).filter(Boolean).length

    if (words < 20) return null // skip placeholders

    const lines = content.split("\n")
    const dialogueLines = lines.filter((l) =>
      /[""\u2014\u2013\u2014\u2013]/.test(l) || /^[-\u2013\u2014]/.test(l.trim())
    ).length
    const paragraphs = content.split(/\n\s*\n/).filter(Boolean).length
    const sentences = content.split(/[.!?]+/).filter(Boolean).length
    const avgSentenceLen = sentences > 0 ? Math.round(words / sentences) : 0

    const tensionWords = (content.match(
      /\b(endurec|dissolv|escur|dor|medo|silêncio|trevas|fogo|quebr|grit|choqu|impacto|perigo|morte|sangue|luz|brilh|explo|arden|feri|corr|fug|queda|ruptura|fratur|colapso|tremor|impuls|despert|emergiu|violên)/gi
    ) ?? []).length
    const tensionScore = words > 0 ? Math.round((tensionWords / words) * 1000) : 0

    return {
      slug: capitulo,
      title: doc.title,
      words,
      dialogueLines,
      totalLines: lines.length,
      paragraphs,
      avgSentenceLen,
      tensionScore,
    }
  }).filter(Boolean)

  // ─── Read contos from filesystem ───
  const contosList = contoSlugs()
  let contosWritten = 0
  const contoWordCounts: Record<string, number> = {}
  for (const { personagem } of contosList) {
    const doc = readMarkdown(`contos/conto-${personagem}.md`)
    const words = (doc.content ?? "").split(/\s+/).filter(Boolean).length
    contoWordCounts[personagem] = words
    if (words > 200) contosWritten++
  }

  // ─── Read biblia from filesystem ───
  const bibliaList = bibliaParts()
  let bibliaComplete = 0
  const bibliaWordCounts: Record<string, number> = {}
  for (const { parte } of bibliaList) {
    const doc = readMarkdown(`biblia/parte-${parte}.md`)
    const words = (doc.content ?? "").split(/\s+/).filter(Boolean).length
    bibliaWordCounts[`parte-${parte}`] = words
    if (words > 50) bibliaComplete++
  }

  // Also read the main bible file
  const mainBible = readMarkdown("koru-ecosystem-briefing.md")
  const mainBibleWords = (mainBible.content ?? "").split(/\s+/).filter(Boolean).length

  // ─── Word counts ───
  const sectionWords: Record<string, number> = {
    biblia: Object.values(bibliaWordCounts).reduce((a, b) => a + b, 0) + mainBibleWords,
    livro: chapters.reduce((a, c) => a + (c?.words ?? 0), 0),
    contos: Object.values(contoWordCounts).reduce((a, b) => a + b, 0),
  }
  const totalWords = Object.values(sectionWords).reduce((a, b) => a + b, 0)

  // ─── All word counts merged ───
  const wordCounts: Record<string, number> = {
    ...bibliaWordCounts,
    ...contoWordCounts,
    "koru-ecosystem-briefing": mainBibleWords,
  }
  for (const ch of chapters) {
    if (ch) wordCounts[ch.slug] = ch.words
  }

  // ─── Character mentions in livro (from filesystem) ───
  const characterNames = ["temiku", "amara", "oruku", "beku", "obaru", "kemdi", "orike", "temi", "kemi"]
  const charMentions: Record<string, Record<string, number>> = {}
  for (const ch of chapters) {
    if (!ch) continue
    const slug = ch.slug === "epilogo" ? "epilogo" : `capitulo-${ch.slug}`
    const doc = readMarkdown(`livro/${slug}.md`)
    const lower = (doc.content ?? "").toLowerCase()
    for (const name of characterNames) {
      const regex = new RegExp(`\\b${name}\\b`, "gi")
      const count = (lower.match(regex) ?? []).length
      if (count > 0) {
        if (!charMentions[ch.slug]) charMentions[ch.slug] = {}
        charMentions[ch.slug][name] = count
      }
    }
  }

  // ─── Supabase data (tasks + storage) with 3s timeout ───
  const supabaseTimeout = <T,>(promise: Promise<T>, fallback: T): Promise<T> =>
    Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), 3000))])

  let taskStats = {
    total: 0, todo: 0, inProgress: 0, done: 0, highPriority: 0,
    byCategory: {} as Record<string, number>,
  }
  let totalBanners = 0
  let totalGallery = 0

  try {
    const admin = createAdminClient()
    const [tasksResult, bannersResult, galleryResult] = await supabaseTimeout(
      Promise.all([
        admin.from("tasks").select("*"),
        admin.storage.from("banners").list(""),
        admin.storage.from("gallery").list(""),
      ]),
      [{ data: null }, { data: null }, { data: null }] as any
    )

    const tasks = tasksResult.data
    if (tasks) {
      taskStats = {
        total: tasks.length,
        todo: tasks.filter((t: any) => t.status === "todo").length,
        inProgress: tasks.filter((t: any) => t.status === "in_progress").length,
        done: tasks.filter((t: any) => t.status === "done").length,
        highPriority: tasks.filter((t: any) => t.priority === "high" && t.status !== "done").length,
        byCategory: {} as Record<string, number>,
      }
      for (const t of tasks) {
        taskStats.byCategory[(t as any).category] = (taskStats.byCategory[(t as any).category] ?? 0) + 1
      }
    }
    totalBanners = (bannersResult.data ?? []).filter((f: any) => !f.name.startsWith(".")).length
    totalGallery = (galleryResult.data ?? []).filter((f: any) => !f.name.startsWith(".")).length
  } catch {
    // Supabase unavailable — continue with filesystem data only
  }

  const totalDocuments = bibliaComplete + chapters.length + contosWritten

  return NextResponse.json({
    totalWords,
    sectionWords,
    wordCounts,
    chapters,
    charMentions,
    taskStats,
    contosWritten,
    totalContos: contosList.length,
    bibliaComplete,
    livroChapters: chapters.length,
    totalDocuments,
    totalCharacters: characterNames.length,
    totalBanners,
    totalGallery,
  })
}
