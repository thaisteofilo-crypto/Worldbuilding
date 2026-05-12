"use client"

import { useCallback, useEffect, useState } from "react"
import {
  DocumentStatus,
  isValidStatus,
  parseStatusKey,
  statusKey,
} from "@/lib/document-status"

const LS_KEY = "koru-doc-statuses"

function lsLoad(): Record<string, DocumentStatus> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    const result: Record<string, DocumentStatus> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (isValidStatus(v)) result[k] = v
    }
    return result
  } catch { return {} }
}

function lsSave(statuses: Record<string, DocumentStatus>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(statuses)) } catch {}
}

interface SiteContentRow {
  key: string
  value: string
}

export function useDocumentStatuses() {
  const [statuses, setStatuses] = useState<Record<string, DocumentStatus>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Load localStorage immediately so statuses appear without waiting for API
    const local = lsLoad()
    if (Object.keys(local).length > 0) setStatuses(local)

    let cancelled = false
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const rows: SiteContentRow[] = data.content ?? []
        const fromApi: Record<string, DocumentStatus> = {}
        for (const row of rows) {
          const path = parseStatusKey(row.key)
          if (!path) continue
          if (isValidStatus(row.value)) fromApi[path] = row.value
        }
        // API wins over localStorage when it returns a value
        setStatuses((prev) => {
          const merged = { ...prev, ...fromApi }
          lsSave(merged)
          return merged
        })
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
    return () => { cancelled = true }
  }, [])

  const setStatus = useCallback(async (docPath: string, status: DocumentStatus | null) => {
    setStatuses((prev) => {
      const next = { ...prev }
      if (status) next[docPath] = status
      else delete next[docPath]
      lsSave(next)
      return next
    })

    fetch("/api/site-content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: statusKey(docPath), value: status ?? "" }),
    }).catch(() => {})
  }, [])

  return { statuses, loaded, setStatus }
}
