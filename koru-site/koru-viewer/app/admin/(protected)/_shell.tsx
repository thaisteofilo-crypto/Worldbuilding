'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
          <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-[0.15em]">
            Admin
          </Badge>
        </header>
        <main id="main-content" className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
