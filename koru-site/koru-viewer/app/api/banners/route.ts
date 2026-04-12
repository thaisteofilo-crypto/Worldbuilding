import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const BANNER_SLOTS = ["hero", "hero-video", "personagens", "biblia", "livro", "contos", "referencias"]

export async function GET() {
  const admin = createAdminClient()

  const { data: files, error } = await admin.storage.from("banners").list("", {
    sortBy: { column: "name", order: "asc" },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const banners: Record<string, string> = {}
  for (const file of files || []) {
    const slot = file.name.split(".")[0]
    if (BANNER_SLOTS.includes(slot)) {
      const { data } = admin.storage.from("banners").getPublicUrl(file.name)
      banners[slot] = data.publicUrl
    }
  }

  return NextResponse.json({ banners })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const slot = formData.get("slot") as string | null

  if (!file || !slot || !BANNER_SLOTS.includes(slot)) {
    return NextResponse.json({ error: "Missing file or invalid slot" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() || "jpg"
  const fileName = `${slot}.${ext}`

  const admin = createAdminClient()

  // Delete existing file for this slot
  const { data: existing } = await admin.storage.from("banners").list("")
  const oldFile = existing?.find((f) => f.name.startsWith(`${slot}.`))
  if (oldFile) {
    await admin.storage.from("banners").remove([oldFile.name])
  }

  // Upload new file
  const arrayBuffer = await file.arrayBuffer()
  const { error } = await admin.storage.from("banners").upload(fileName, new Uint8Array(arrayBuffer), {
    contentType: file.type,
    upsert: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from("banners").getPublicUrl(fileName)

  return NextResponse.json({ url: urlData.publicUrl, slot })
}

export async function DELETE(req: NextRequest) {
  const { slot } = await req.json()
  if (!slot || !BANNER_SLOTS.includes(slot)) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: existing } = await admin.storage.from("banners").list("")
  const oldFile = existing?.find((f) => f.name.startsWith(`${slot}.`))

  if (oldFile) {
    await admin.storage.from("banners").remove([oldFile.name])
  }

  return NextResponse.json({ ok: true })
}
