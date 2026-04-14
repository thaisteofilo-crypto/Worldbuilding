import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Views: front, profile, back
const VALID_VIEWS = ["front", "profile", "back"]

// Build Supabase Storage public URL statically — avoids N+1 getPublicUrl() calls in loops.
function storagePublicUrl(bucket: string, filename: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/${bucket}/${filename}`
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const characterId = formData.get("characterId") as string | null
  const slug = formData.get("slug") as string | null
  const view = formData.get("view") as string | null

  if (!file || !characterId || !slug) {
    return NextResponse.json({ error: "Missing file, characterId or slug" }, { status: 400 })
  }

  const viewName = view && VALID_VIEWS.includes(view) ? view : "front"
  const ext = file.name.split(".").pop() || "jpg"
  const fileName = `${slug}-${viewName}.${ext}`

  const admin = createAdminClient()

  // Delete existing image for this character+view
  const { data: existing } = await admin.storage.from("characters").list("")
  const oldFile = existing?.find((f) => f.name.startsWith(`${slug}-${viewName}.`))
  if (oldFile) {
    await admin.storage.from("characters").remove([oldFile.name])
  }

  // Upload new file
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await admin.storage.from("characters").upload(fileName, new Uint8Array(arrayBuffer), {
    contentType: file.type,
    upsert: true,
  })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const publicUrl = storagePublicUrl("characters", fileName)

  // Update character record with front image URL (for backwards compat)
  if (viewName === "front") {
    await admin
      .from("characters")
      .update({ image_url: publicUrl })
      .eq("id", characterId)
  }

  return NextResponse.json({ url: publicUrl, view: viewName })
}

export async function DELETE(req: NextRequest) {
  const { characterId, slug, view } = await req.json()
  if (!characterId || !slug) {
    return NextResponse.json({ error: "Missing characterId or slug" }, { status: 400 })
  }

  const viewName = view && VALID_VIEWS.includes(view) ? view : "front"
  const admin = createAdminClient()

  // Remove from storage
  const { data: existing } = await admin.storage.from("characters").list("")
  const oldFile = existing?.find((f) => f.name.startsWith(`${slug}-${viewName}.`))
  if (oldFile) {
    await admin.storage.from("characters").remove([oldFile.name])
  }

  // Clear image_url in database if removing front
  if (viewName === "front") {
    await admin
      .from("characters")
      .update({ image_url: null })
      .eq("id", characterId)
  }

  return NextResponse.json({ ok: true })
}

// GET: list all character images from storage
export async function GET() {
  const admin = createAdminClient()

  const { data: files, error } = await admin.storage.from("characters").list("", {
    sortBy: { column: "name", order: "asc" },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Build a map: { slug: { front: url, profile: url, back: url } }
  const images: Record<string, Record<string, string>> = {}

  for (const file of files ?? []) {
    if (file.name.startsWith(".")) continue
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, "")
    // Match pattern: slug-view
    const lastDash = nameWithoutExt.lastIndexOf("-")
    if (lastDash === -1) continue

    const view = nameWithoutExt.slice(lastDash + 1)
    const slug = nameWithoutExt.slice(0, lastDash)

    if (!VALID_VIEWS.includes(view)) continue

    if (!images[slug]) images[slug] = {}
    images[slug][view] = storagePublicUrl("characters", file.name)
  }

  return NextResponse.json({ images })
}
