"use client"

import dynamic from "next/dynamic"

const KoruChat = dynamic(
  () => import("@/components/koru/koru-chat").then((m) => m.KoruChat),
  { ssr: false }
)

export function KoruChatLoader() {
  return <KoruChat />
}
