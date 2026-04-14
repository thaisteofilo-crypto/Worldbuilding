import { createAdminClient } from "@/lib/supabase/admin"
import { characters as hardcoded, characterOrder } from "@/lib/characters"

export interface ViewerCharacter {
  slug: string
  name: string
  role: string
  gradient: string
  accentColor: string
  morphology: string
  ability: string
  status: string
  origin: string
  description: string
  species: string
  location: string
  mark: string
  quote: string
  relations: { name: string; slug: string; type: string }[]
}

const DEFAULT_GRADIENT =
  "linear-gradient(160deg, oklch(0.12 0.01 280) 0%, oklch(0.25 0.08 220) 50%, oklch(0.14 0.01 280) 100%)"

function dbToViewer(db: Record<string, unknown>): ViewerCharacter {
  const slug = db.slug as string
  const fallback = hardcoded[slug]
  return {
    slug,
    name: (db.name as string) ?? fallback?.name ?? slug,
    role: (db.role as string) ?? fallback?.role ?? "",
    gradient: (db.gradient as string) ?? fallback?.gradient ?? DEFAULT_GRADIENT,
    accentColor: (db.accent_color as string) ?? fallback?.accentColor ?? "var(--foreground)",
    morphology: (db.morphology as string) ?? fallback?.morphology ?? "",
    ability: (db.ability as string) ?? fallback?.ability ?? "",
    status: (db.status as string) ?? fallback?.status ?? "",
    origin: (db.origin as string) ?? fallback?.origin ?? "",
    description: (db.description as string) ?? fallback?.description ?? "",
    species: (db.species as string) ?? fallback?.species ?? "",
    location: (db.location as string) ?? fallback?.location ?? "",
    mark: (db.mark as string) ?? fallback?.mark ?? "",
    quote: (db.quote as string) ?? fallback?.quote ?? "",
    relations: fallback?.relations ?? [],
  }
}

function hardcodedFallback(): { chars: Record<string, ViewerCharacter>; order: string[] } {
  const chars: Record<string, ViewerCharacter> = {}
  for (const key of characterOrder) {
    chars[key] = { slug: key, ...hardcoded[key] }
  }
  return { chars, order: [...characterOrder] }
}

export async function getCharactersForViewer(): Promise<{
  chars: Record<string, ViewerCharacter>
  order: string[]
}> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("characters")
      .select("*")
      .order("order_index", { ascending: true, nullsFirst: false })
      .order("name")

    if (error || !data || data.length === 0) return hardcodedFallback()

    const chars: Record<string, ViewerCharacter> = {}
    const order: string[] = []
    for (const db of data) {
      chars[db.slug] = dbToViewer(db)
      order.push(db.slug)
    }
    return { chars, order }
  } catch {
    return hardcodedFallback()
  }
}
