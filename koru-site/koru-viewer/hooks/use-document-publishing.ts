"use client"

import { useCallback, useEffect, useState } from "react"
import {
  PublishConfig,
  PublishState,
  isValidPublishState,
  parsePublishAtKey,
  parsePublishKey,
  parsePublishStateKey,
  parsePublishValue,
  publishKey,
  serializePublishConfig,
} from "@/lib/document-publish"

interface SiteContentRow {
  key: string
  value: string
}

const DEFAULT: PublishConfig = { state: "published", at: null }
const LS_KEY = "koru-doc-publishing"

function lsLoad(): Record<string, PublishConfig> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch { return {} }
}

function lsSave(configs: Record<string, PublishConfig>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(configs)) } catch {}
}

export function useDocumentPublishing() {
  const [configs, setConfigs] = useState<Record<string, PublishConfig>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Load localStorage immediately
    const local = lsLoad()
    if (Object.keys(local).length > 0) setConfigs(local)

    let cancelled = false
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const rows: SiteContentRow[] = data.content ?? []
        const fromApi: Record<string, PublishConfig> = {}
        // Pass 1: legacy split-key format.
        for (const row of rows) {
          const statePath = parsePublishStateKey(row.key)
          if (statePath) {
            const cfg = fromApi[statePath] ?? { ...DEFAULT }
            if (isValidPublishState(row.value)) cfg.state = row.value as PublishState
            fromApi[statePath] = cfg
            continue
          }
          const atPath = parsePublishAtKey(row.key)
          if (atPath) {
            const cfg = fromApi[atPath] ?? { ...DEFAULT }
            cfg.at = row.value || null
            fromApi[atPath] = cfg
          }
        }
        // Pass 2: new single-key format wins over legacy.
        for (const row of rows) {
          const path = parsePublishKey(row.key)
          if (!path) continue
          const parsed = parsePublishValue(row.value)
          if (parsed) fromApi[path] = parsed
        }
        // localStorage wins — local change is always the user's latest intent
        setConfigs((prev) => {
          const merged = { ...fromApi, ...prev }
          lsSave(merged)
          return merged
        })
        setLoaded(true)
      })
      .catch((err) => {
        console.error("[publishing] failed to load configs:", err)
        setLoaded(true)
      })
    return () => { cancelled = true }
  }, [])

  const setConfig = useCallback(async (docPath: string, next: PublishConfig) => {
    setConfigs((prev) => {
      const updated = { ...prev, [docPath]: next }
      lsSave(updated)
      return updated
    })

    const key = publishKey(docPath)
    const value = serializePublishConfig(next)
    console.log("[publishing] saving", { key, value })

    const res = await fetch("/api/site-content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    })

    let body: { ok?: boolean; localOk?: boolean; supabaseOk?: boolean; supabaseError?: string | null; error?: string } = {}
    try { body = await res.json() } catch { /* keep empty */ }

    console.log("[publishing] response", res.status, body)

    if (!res.ok) {
      let detail = "HTTP " + res.status
      if (body.error) detail = body.error
      if (body.supabaseError) detail += " — supabase: " + body.supabaseError
      throw new Error(detail)
    }

    // Surface partial failures: API returns 200 even when only local FS wrote.
    // In production FS is read-only, so a Supabase failure means the change
    // won't survive a refresh.
    if (body.supabaseOk === false) {
      const detail = "Supabase rejeitou: " + (body.supabaseError ?? "sem detalhe")
      throw new Error(detail)
    }
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
