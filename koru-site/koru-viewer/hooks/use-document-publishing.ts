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
    const stateValue: string = next.state
    const atValue: string = next.state === "scheduled" && next.at ? next.at : ""

    async function patch(key: string, value: string) {
      const res = await fetch("/api/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
      if (!res.ok) {
        let detail = "HTTP " + res.status
        try {
          const data = await res.json()
          if (data?.error) detail = String(data.error)
          if (data?.supabaseError) detail += " — supabase: " + data.supabaseError
        } catch { /* keep status-only */ }
        throw new Error(detail)
      }
      const data = await res.json().catch(() => ({}))
      // Surface partial failures: API returns 200 even when only local FS wrote
      // (Supabase upsert failed). In production FS is read-only, so a Supabase
      // failure means the change won't survive a refresh.
      if (data && data.supabaseOk === false && data.localOk === false) {
        throw new Error("API returned 200 but neither local nor Supabase persisted")
      }
    }

    await Promise.all([
      patch(publishStateKey(docPath), stateValue),
      patch(publishAtKey(docPath), atValue),
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
