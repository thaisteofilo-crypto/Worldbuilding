"use client"

import { useState, useEffect, useCallback } from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CharacterData {
  name: string
  role: string
}

export interface HomepageData {
  siteContent: Record<string, string> | null
  banners: Record<string, string> | null
  cardImages: Record<string, string> | null
  characters: Record<string, CharacterData> | null
  characterOrder: string[]
  loading: boolean
}

// ---------------------------------------------------------------------------
// Default character data (static fallback — no DB required)
// ---------------------------------------------------------------------------

const DEFAULT_CHARACTERS: Record<string, CharacterData> = {
  temiku: { name: "Temiku", role: "Híbrida, filha do evento" },
  amara: { name: "Amara", role: "Onkweri, memória solidificada" },
  oruku: { name: "Oruku", role: "Azuri, passagem presa" },
  beku: { name: "Beku", role: "Onkweri, guardião" },
  obaru: { name: "Obaru", role: "Azuri, frequência" },
  kemdi: { name: "Kemdi", role: "Guardião, limiar" },
  temi: { name: "Temi", role: "Onkweri, silêncio" },
  orike: { name: "Orike", role: "Azuri, ressonância" },
  kairo: { name: "Kairo", role: "Humana, Era VI" },
}

const DEFAULT_CHARACTER_ORDER = [
  "temiku", "amara", "oruku", "beku", "obaru", "kemdi", "temi", "orike", "kairo",
]

// ---------------------------------------------------------------------------
// useHomepageData
// ---------------------------------------------------------------------------

export function useHomepageData(): HomepageData {
  const [siteContent, setSiteContent] = useState<Record<string, string> | null>(null)
  const [banners, setBanners] = useState<Record<string, string> | null>(null)
  const [cardImages, setCardImages] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load persisted content from localStorage (local-only viewer)
    try {
      const stored = localStorage.getItem("koru-site-content")
      if (stored) setSiteContent(JSON.parse(stored) as Record<string, string>)
      else setSiteContent({})

      const storedBanners = localStorage.getItem("koru-banners")
      if (storedBanners) setBanners(JSON.parse(storedBanners) as Record<string, string>)
      else setBanners({})

      const storedCards = localStorage.getItem("koru-card-images")
      if (storedCards) setCardImages(JSON.parse(storedCards) as Record<string, string>)
      else setCardImages({})
    } catch {
      setSiteContent({})
      setBanners({})
      setCardImages({})
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    siteContent,
    banners,
    cardImages,
    characters: DEFAULT_CHARACTERS,
    characterOrder: DEFAULT_CHARACTER_ORDER,
    loading,
  }
}

// ---------------------------------------------------------------------------
// useSaveContent
// ---------------------------------------------------------------------------

export function useSaveContent() {
  const save = useCallback(async (key: string, value: string): Promise<void> => {
    try {
      const stored = localStorage.getItem("koru-site-content")
      const current: Record<string, string> = stored ? JSON.parse(stored) : {}
      current[key] = value
      localStorage.setItem("koru-site-content", JSON.stringify(current))
    } catch {
      // silently ignore storage errors
    }
  }, [])

  return { save }
}

// ---------------------------------------------------------------------------
// useUploadCardImage
// ---------------------------------------------------------------------------

export function useUploadCardImage() {
  const upload = useCallback(async (file: File, cardKey: string): Promise<void> => {
    const dataUrl = await fileToDataUrl(file)
    try {
      const stored = localStorage.getItem("koru-card-images")
      const current: Record<string, string> = stored ? JSON.parse(stored) : {}
      current[cardKey] = dataUrl
      localStorage.setItem("koru-card-images", JSON.stringify(current))
    } catch {
      // silently ignore
    }
  }, [])

  return { upload }
}

// ---------------------------------------------------------------------------
// useUploadBanner
// ---------------------------------------------------------------------------

export function useUploadBanner() {
  const upload = useCallback(async (file: File, slot: string): Promise<void> => {
    const dataUrl = await fileToDataUrl(file)
    try {
      const stored = localStorage.getItem("koru-banners")
      const current: Record<string, string> = stored ? JSON.parse(stored) : {}
      current[slot] = dataUrl
      localStorage.setItem("koru-banners", JSON.stringify(current))
    } catch {
      // silently ignore
    }
  }, [])

  return { upload }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
