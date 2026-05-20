'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--background)' }}
    >
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <header aria-label="Cabeçalho mobile" className="flex h-14 items-center gap-3 px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu de navegação"
          >
            <Menu size={20} aria-hidden="true" />
          </Button>
          <span className="font-serif text-lg tracking-tight text-foreground">
            Korú
          </span>
          <span className="rounded-full border border-admin-badge-border px-1.5 py-0.5 font-sans text-[9px] tracking-[0.15em] uppercase text-muted-foreground">
            Admin
          </span>
        </header>
        <main id="main-content" className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
