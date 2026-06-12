import { NextResponse } from "next/server"
import { readdir, stat } from "fs/promises"
import { join } from "path"

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp"]

export async function GET() {
  try {
    const dir = join(process.cwd(), "public", "media")
    const files = await readdir(dir)
    const imageFiles = files.filter((f) =>
      IMAGE_EXTS.some((ext) => f.toLowerCase().endsWith(ext))
    )
    const withStats = await Promise.all(
      imageFiles.map(async (f) => {
        const s = await stat(join(dir, f))
        return { file: f, size: s.size }
      })
    )
    const images = withStats
      .filter(({ size }) => size > 2000)
      .map(({ file }) => `/media/${file}`)
    return NextResponse.json({ images })
  } catch {
    return NextResponse.json({ images: [] })
  }
}
