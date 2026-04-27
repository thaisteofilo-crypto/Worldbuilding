import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePublicSite } from "@/lib/revalidate"

// Card images are stored in the "card-images" bucket
// Naming convention: {section}-{slug}.{ext}
// Examples: biblia-parte-00.jpg, livro-01.jpg, referencia-harry-potter.jpg

export async function GET() {
  const admin = createAdminClient()

  const { data: files, error } = await admin.storage.from("card-images").list("", {
    sortBy: { column: "name", order: "asc" },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const images: Record<string, string> = {}
  for (const file of files ?? []) {
    if (file.name.startsWith(".")) continue
    const key = file.name.replace(/\.[^.]+$/, "")
    const { data } = admin.storage.from("card-images").getPublicUrl(file.name)
    const v = file.updated_at || file.created_at || ""
    const bust = v ? `?v=${new Date(v).getTime()}` : `?v=${Date.now()}`
    images[key] = data.publicUrl + bust
  }

  return NextResponse.json({ images })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const key = formData.get("key") as string | null

  if (!file || !key) {
    return NextResponse.json({ error: "Missing file or key" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() || "jpg"
  const fileName = `${key}.${ext}`

  const admin = createAdminClient()

  // Remove existing file for this key
  const { data: existing } = await admin.storage.from("card-images").list("")
  const oldFile = existing?.find((f) => f.name.startsWith(`${key}.`))
  if (oldFile) {
    await admin.storage.from("card-images").remove([oldFile.name])
  }

  const arrayBuffer = await file.arrayBuffer()
  const { error } = await admin.storage.from("card-images").upload(fileName, new Uint8Array(arrayBuffer), {
    contentType: file.type,
    upsert: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from("card-images").getPublicUrl(fileName)
  revalidatePublicSite()
  return NextResponse.json({ url: `${urlData.publicUrl}?v=${Date.now()}`, key })
}

export async function DELETE(req: NextRequest) {
  const { key } = await req.json()
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: existing } = await admin.storage.from("card-images").list("")
  const oldFile = existing?.find((f) => f.name.startsWith(`${key}.`))
  if (oldFile) {
    await admin.storage.from("card-images").remove([oldFile.name])
  }

  revalidatePublicSite()
  return NextResponse.json({ ok: true })
}
