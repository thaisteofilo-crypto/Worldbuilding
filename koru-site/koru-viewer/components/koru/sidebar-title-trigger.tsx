"use client"

import { useSidebar } from "@/components/ui/sidebar"

export function SidebarTitleTrigger() {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      onClick={toggleSidebar}
      className="font-serif text-lg leading-none cursor-pointer select-none hover:opacity-70 transition-opacity"
      style={{
        fontFamily: "var(--font-serif), Georgia, serif",
        color: "var(--foreground)",
      }}
    >
      Korú
    </button>
  )
}
