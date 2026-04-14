"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const isAdmin = document.cookie.split('; ').find(c => c.startsWith('koru-admin='))?.split('=')[1]
    if (isAdmin === "true") {
      setAuthorized(true)
    } else {
      router.replace("/admin/login")
    }
  }, [router])

  if (!authorized) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
          Verificando acesso...
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
