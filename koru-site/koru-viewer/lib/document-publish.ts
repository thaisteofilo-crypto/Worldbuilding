// Publishing state per document — gates which cards/pages the public site shows.
// Stored alongside other site_content keys, sharing the same Supabase table.
//
// Keys (one or both per doc):
//   publish.<path>.state  one of "published" | "draft" | "scheduled"
//   publish.<path>.at     ISO 8601 datetime (only when state === "scheduled")
//
// Default (no keys set): "published" — keeps existing content visible without
// requiring a backfill.

export type PublishState = "published" | "draft" | "scheduled"

export interface PublishConfig {
  state: PublishState
  // ISO datetime — only meaningful when state === "scheduled".
  at?: string | null
}

const STATE_PREFIX = "publish."
const STATE_SUFFIX = ".state"
const AT_SUFFIX = ".at"

export function publishStateKey(docPath: string): string {
  return STATE_PREFIX + docPath + STATE_SUFFIX
}

export function publishAtKey(docPath: string): string {
  return STATE_PREFIX + docPath + AT_SUFFIX
}

export function parsePublishStateKey(key: string): string | null {
  if (!key.startsWith(STATE_PREFIX) || !key.endsWith(STATE_SUFFIX)) return null
  return key.slice(STATE_PREFIX.length, -STATE_SUFFIX.length)
}

export function parsePublishAtKey(key: string): string | null {
  if (!key.startsWith(STATE_PREFIX) || !key.endsWith(AT_SUFFIX)) return null
  return key.slice(STATE_PREFIX.length, -AT_SUFFIX.length)
}

export function isValidPublishState(value: unknown): value is PublishState {
  return value === "published" || value === "draft" || value === "scheduled"
}

export function getPublishConfig(
  siteContent: Record<string, string>,
  docPath: string,
): PublishConfig {
  const stateRaw = siteContent[publishStateKey(docPath)]
  const at = siteContent[publishAtKey(docPath)] || null
  const state = isValidPublishState(stateRaw) ? stateRaw : "published"
  return { state, at }
}

// Single source of truth for "is this doc visible to the public right now".
export function isPublic(cfg: PublishConfig, now: Date = new Date()): boolean {
  if (cfg.state === "published") return true
  if (cfg.state === "draft") return false
  if (cfg.state === "scheduled") {
    if (!cfg.at) return false
    const target = new Date(cfg.at)
    if (isNaN(target.getTime())) return false
    return now.getTime() >= target.getTime()
  }
  return true
}

// Convenience: build a Map of path → PublishConfig from a flat siteContent object.
// Includes only paths that have an explicit publish.* key set.
export function collectPublishConfigs(
  siteContent: Record<string, string>,
): Map<string, PublishConfig> {
  const map = new Map<string, PublishConfig>()
  for (const [key, value] of Object.entries(siteContent)) {
    const statePath = parsePublishStateKey(key)
    if (statePath) {
      const existing = map.get(statePath) ?? { state: "published" as PublishState, at: null }
      if (isValidPublishState(value)) existing.state = value
      map.set(statePath, existing)
      continue
    }
    const atPath = parsePublishAtKey(key)
    if (atPath) {
      const existing = map.get(atPath) ?? { state: "published" as PublishState, at: null }
      existing.at = value || null
      map.set(atPath, existing)
    }
  }
  return map
}
