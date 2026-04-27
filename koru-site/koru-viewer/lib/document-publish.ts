// Publishing state per document — gates which cards/pages the public site shows.
// Stored as a single JSON value in the site_content table (one row per doc).
//
//   key:   publish.<path>           e.g. "publish.contos/conto-amara.md"
//   value: JSON {"state":"...","at":"...|null"}
//
// Backwards compat: legacy split-key format (publish.<path>.state +
// publish.<path>.at) is still readable. Writes always use the single-key
// format below.
//
// Default (no key set): "published" — keeps existing content visible without
// requiring a backfill.

export type PublishState = "published" | "draft" | "scheduled"

export interface PublishConfig {
  state: PublishState
  // ISO datetime — only meaningful when state === "scheduled".
  at?: string | null
}

const PREFIX = "publish."
const LEGACY_STATE_SUFFIX = ".state"
const LEGACY_AT_SUFFIX = ".at"

export function publishKey(docPath: string): string {
  return PREFIX + docPath
}

export function parsePublishKey(key: string): string | null {
  if (!key.startsWith(PREFIX)) return null
  // Skip legacy keys here — collectPublishConfigs handles those separately.
  if (key.endsWith(LEGACY_STATE_SUFFIX) || key.endsWith(LEGACY_AT_SUFFIX)) return null
  return key.slice(PREFIX.length)
}

// Legacy parsers — still used for reading existing data.
export function parsePublishStateKey(key: string): string | null {
  if (!key.startsWith(PREFIX) || !key.endsWith(LEGACY_STATE_SUFFIX)) return null
  return key.slice(PREFIX.length, -LEGACY_STATE_SUFFIX.length)
}

export function parsePublishAtKey(key: string): string | null {
  if (!key.startsWith(PREFIX) || !key.endsWith(LEGACY_AT_SUFFIX)) return null
  return key.slice(PREFIX.length, -LEGACY_AT_SUFFIX.length)
}

export function isValidPublishState(value: unknown): value is PublishState {
  return value === "published" || value === "draft" || value === "scheduled"
}

export function serializePublishConfig(cfg: PublishConfig): string {
  return JSON.stringify({ state: cfg.state, at: cfg.at ?? null })
}

export function parsePublishValue(raw: string): PublishConfig | null {
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    const state = parsed.state
    if (!isValidPublishState(state)) return null
    const at = typeof parsed.at === "string" && parsed.at ? parsed.at : null
    return { state, at }
  } catch {
    return null
  }
}

export function getPublishConfig(
  siteContent: Record<string, string>,
  docPath: string,
): PublishConfig {
  // New single-key format wins.
  const raw = siteContent[publishKey(docPath)]
  if (raw) {
    const parsed = parsePublishValue(raw)
    if (parsed) return parsed
  }
  // Legacy fallback.
  const stateRaw = siteContent[PREFIX + docPath + LEGACY_STATE_SUFFIX]
  const at = siteContent[PREFIX + docPath + LEGACY_AT_SUFFIX] || null
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
// Includes only paths that have an explicit publish.* key set. The new
// single-key format (publish.<path> = JSON) wins when both formats exist.
export function collectPublishConfigs(
  siteContent: Record<string, string>,
): Map<string, PublishConfig> {
  const map = new Map<string, PublishConfig>()
  // Pass 1: legacy split keys.
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
  // Pass 2: new single-key format overrides legacy.
  for (const [key, value] of Object.entries(siteContent)) {
    const path = parsePublishKey(key)
    if (!path) continue
    const parsed = parsePublishValue(value)
    if (parsed) map.set(path, parsed)
  }
  return map
}
