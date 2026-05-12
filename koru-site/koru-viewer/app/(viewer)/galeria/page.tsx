import { createAdminClient } from "@/lib/supabase/admin"
import { GalleryClient, type GalleryImage } from "./gallery-client"

export const dynamic = "force-dynamic"

// Mesmo helper usado em /api/gallery — evita N+1 chamadas a getPublicUrl().
function storagePublicUrl(bucket: string, filename: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/${bucket}/${filename}`
}

async function loadGalleryImages(): Promise<{ images: GalleryImage[]; error: boolean }> {
  try {
    const admin = createAdminClient()
    const { data: files, error } = await admin.storage.from("gallery").list("", {
      sortBy: { column: "created_at", order: "desc" },
    })
    if (error) return { images: [], error: true }
    const images = (files ?? [])
      .filter((f) => !f.name.startsWith("."))
      .map((f) => ({
        name: f.name,
        url: storagePublicUrl("gallery", f.name),
        created_at: f.created_at,
      }))
    return { images, error: false }
  } catch {
    return { images: [], error: true }
  }
}

export default async function GaleriaPage() {
  const { images, error } = await loadGalleryImages()

  return (
    <div className="h-[100dvh] overflow-y-auto" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 md:px-10 py-4" style={{ background: "var(--background)" }}>
        <div className="flex items-end gap-4">
          <h1
            className="font-serif text-3xl md:text-4xl leading-none"
            style={{ color: "var(--foreground)" }}
          >
            Galeria
          </h1>
          <p className="font-sans text-sm pb-0.5" style={{ color: "var(--muted-foreground)" }}>
            Cenas do Akwu
          </p>
        </div>
        <div className="mt-3 h-px" style={{ background: "var(--border)" }} />
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-32 gap-5">
          <p className="font-serif text-xl" style={{ color: "var(--foreground)" }}>
            Nao foi possivel carregar as cenas.
          </p>
          <a
            href="/galeria"
            className="font-sans text-sm rounded-full px-5 py-2 transition-colors inline-block"
            style={{
              background: "var(--surface)",
              color: "var(--muted-foreground)",
              border: "1px solid var(--border)",
            }}
          >
            Tentar novamente
          </a>
        </div>
      ) : (
        <GalleryClient initialImages={images} />
      )}
    </div>
  )
}
