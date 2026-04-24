"use client"

import { useCallback, useEffect, useState } from "react"
import {
  DocumentStatus,
  isValidStatus,
  parseStatusKey,
  statusKey,
} from "@/lib/document-status"

interface SiteContentRow {
  key: string
  value: string
}

export function useDocumentStatuses() {
  const [statuses, setStatuses] = useState<Record<string, DocumentStatus>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const rows: SiteContentRow[] = data.content ?? []
        const next: Record<string, DocumentStatus> = {}
        for (const row of rows) {
          const path = parseStatusKey(row.key)
          if (!path) continue
          if (isValidStatus(row.value)) next[path] = row.value
        }
        setStatuses(next)
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
      return next
    })

    await fetch("/api/site-content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: statusKey(docPath), value: status ?? "" }),
    }).catch(() => { /* optimistic UI already applied */ })
  }, [])

  return { statuses, loaded, setStatus }
}
