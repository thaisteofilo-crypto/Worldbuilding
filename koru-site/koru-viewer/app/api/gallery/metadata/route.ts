import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePublicSite } from "@/lib/revalidate"

const META_FILE = ".prompts.json"
const BUCKET = "gallery"

type ImageMeta = { prompt?: string; tags?: string[] }
type MetaMap = Record<string, ImageMeta>

async function readMeta(supabase: ReturnType<typeof createAdminClient>): Promise<MetaMap> {
  const { data, error } = await supabase.storage.from(BUCKET).download(META_FILE)
  if (error || !data) return {}
  try {
    const text = await data.text()
    const raw = JSON.parse(text)
    // Normalize old string format for backward compatibility
    const result: MetaMap = {}
    for (const [key, val] of Object.entries(raw)) {
      if (typeof val === "string") {
        result[key] = { prompt: val, tags: [] }
      } else {
        result[key] = val as ImageMeta
      }
    }
    return result
  } catch {
    return {}
  }
}

async function writeMeta(supabase: ReturnType<typeof createAdminClient>, meta: MetaMap) {
  const blob = new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" })
  await supabase.storage.from(BUCKET).upload(META_FILE, blob, {
    contentType: "application/json",
    upsert: true,
  })
}

// GET - fetch all metadata or one by name
export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const name = req.nextUrl.searchParams.get("name")
  const meta = await readMeta(supabase)

  if (name) {
    const entry = meta[name] ?? {}
    return NextResponse.json({
      metadata: { name, prompt: entry.prompt ?? "", tags: entry.tags ?? [] },
    })
  }

  const metadata: Record<string, { prompt: string; tags: string[] }> = {}
  for (const [key, val] of Object.entries(meta)) {
    metadata[key] = { prompt: val.prompt ?? "", tags: val.tags ?? [] }
  }
  return NextResponse.json({ metadata })
}

// POST - save prompt and/or tags for an image (merges, does not replace)
export async function POST(req: NextRequest) {
  const supabase = createAdminClient()
  const body = await req.json()
  const { name, prompt, tags } = body

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  const meta = await readMeta(supabase)
  if (!meta[name]) meta[name] = {}
  if (prompt !== undefined) meta[name].prompt = prompt
  if (tags !== undefined) meta[name].tags = tags

  // Clean up empty entries
  const entry = meta[name]
  if (!entry.prompt && !entry.tags?.length) {
    delete meta[name]
  }

  await writeMeta(supabase, meta)
  revalidatePublicSite()
  return NextResponse.json({ ok: true })
}

// DELETE - remove metadata when image is deleted
export async function DELETE(req: NextRequest) {
  const supabase = createAdminClient()
  const { name } = await req.json()

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  const meta = await readMeta(supabase)
  delete meta[name]
  await writeMeta(supabase, meta)

  revalidatePublicSite()
  return NextResponse.json({ ok: true })
}
