'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

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
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-admin-hover hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
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
