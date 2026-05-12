import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const REQUIRED_BUCKETS = ["characters", "card-images", "gallery"]

export async function POST(req: NextRequest) {
  // Mesma verificação que o middleware faz em /admin: exige cookie koru-admin
  // batendo com ADMIN_TOKEN. Sem auth, 401.
  const adminToken = req.cookies.get("koru-admin")?.value
  const adminExpected = process.env.ADMIN_TOKEN
  if (!adminExpected || adminToken !== adminExpected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: existing } = await admin.storage.listBuckets()
  const existingNames = (existing ?? []).map((b) => b.name)

  const created: string[] = []
  const errors: string[] = []

  for (const bucket of REQUIRED_BUCKETS) {
    if (existingNames.includes(bucket)) {
      continue
    }
    const { error } = await admin.storage.createBucket(bucket, { public: true })
    if (error) {
      errors.push(`${bucket}: ${error.message}`)
    } else {
      created.push(bucket)
    }
  }

  return NextResponse.json({
    existing: existingNames,
    created,
    errors,
  })
}
