import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const REQUIRED_BUCKETS = ["characters", "card-images", "gallery"]

export async function POST() {
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
