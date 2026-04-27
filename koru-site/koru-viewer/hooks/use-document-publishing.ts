"use client"

import { useCallback, useEffect, useState } from "react"
import {
  PublishConfig,
  PublishState,
  isValidPublishState,
  parsePublishAtKey,
  parsePublishStateKey,
  publishAtKey,
  publishStateKey,
} from "@/lib/document-publish"

interface SiteContentRow {
  key: string
  value: string
}

const DEFAULT: PublishConfig = { state: "published", at: null }

export function useDocumentPublishing() {
  const [configs, setConfigs] = useState<Record<string, PublishConfig>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const rows: SiteContentRow[] = data.content ?? []
        const next: Record<string, PublishConfig> = {}
        for (const row of rows) {
          const statePath = parsePublishStateKey(row.key)
          if (statePath) {
            const cfg = next[statePath] ?? { ...DEFAULT }
            if (isValidPublishState(row.value)) cfg.state = row.value
            next[statePath] = cfg
            continue
          }
          const atPath = parsePublishAtKey(row.key)
          if (atPath) {
            const cfg = next[atPath] ?? { ...DEFAULT }
            cfg.at = row.value || null
            next[atPath] = cfg
          }
        }
        setConfigs(next)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
    return () => { cancelled = true }
  }, [])

  const setConfig = useCallback(async (docPath: string, next: PublishConfig) => {
    setConfigs((prev) => ({ ...prev, [docPath]: next }))
    // Two PATCHes — state and at. The at key is cleared when not scheduled.
    const stateValue: string = next.state
    const atValue: string = next.state === "scheduled" && next.at ? next.at : ""
    await Promise.all([
      fetch("/api/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: publishStateKey(docPath), value: stateValue }),
      }).catch(() => { /* optimistic UI applied */ }),
      fetch("/api/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: publishAtKey(docPath), value: atValue }),
      }).catch(() => { /* optimistic UI applied */ }),
    ])
  }, [])

  const getConfig = useCallback((docPath: string): PublishConfig => {
    return configs[docPath] ?? DEFAULT
  }, [configs])

  return { configs, loaded, getConfig, setConfig }
}

// Treat a state of "published" with no at as the default (don't bother persisting).
export function isDefaultConfig(cfg: PublishConfig | undefined): boolean {
  if (!cfg) return true
  return cfg.state === "published" && !cfg.at
}
