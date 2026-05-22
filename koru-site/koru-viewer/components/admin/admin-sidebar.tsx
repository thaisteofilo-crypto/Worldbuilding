'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Image, Monitor, Images,
  Pencil, FileEdit, Lock, MessageCircle, Settings, X, LogOut, UserCheck,
} from 'lucide-react'

const navGroups = [
  {
    items: [
      { href: '/admin', label: 'Dashboard', exact: true, icon: LayoutDashboard },
    ],
  },
  {
    items: [
      { href: '/admin/characters', label: 'Personagens', icon: Users },
      { href: '/admin/banners', label: 'Banners', icon: Image },
      { href: '/admin/card-images', label: 'Cards', icon: Monitor },
      { href: '/admin/gallery', label: 'Galeria', icon: Images },
      { href: '/admin/leads', label: 'Leads', icon: UserCheck },
    ],
  },
  {
    items: [
      { href: '/admin/conteudo', label: 'Conteúdo', icon: Pencil },
      { href: '/admin/editor', label: 'Editor', icon: FileEdit },
      { href: '/admin/publicacao', label: 'Publicação', icon: Lock },
    ],
  },
  {
    items: [
      { href: '/admin/conversas', label: 'Conversas', icon: MessageCircle },
      { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

interface AdminSidebarProps {
  open?: boolean
  onClose?: () => void
}

export function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  useEffect(() => {
    onClose?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (open && typeof window !== 'undefined' && window.innerWidth < 1024) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-label="Navegação principal"
        className={cn(
          'flex w-56 flex-col bg-background border-r border-border',
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <div>
              <span className="font-serif text-lg leading-none text-foreground">Korú</span>
              <p className="font-mono text-[9px] leading-none mt-0.5 text-muted-foreground uppercase tracking-widest">admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Fechar menu"
          >
            <X size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav aria-label="Menu" className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="h-px bg-border my-1.5 mx-1" />}
              {group.items.map((item) => {
                const active = ('exact' in item && item.exact)
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-sans transition-colors duration-150',
                      active
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-[#DEF7F9] hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary',
                    )}
                  >
                    <Icon size={15} aria-hidden="true" className={active ? 'opacity-100' : 'opacity-60'} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-border space-y-1">
          <LogoutButton />
          <p className="font-mono text-[8px] text-muted-foreground/40 uppercase tracking-widest px-3 pb-1">
            v0.1 · stage
          </p>
        </div>
      </aside>
    </>
  )
}

function LogoutButton() {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-sans text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors duration-150"
    >
      <LogOut size={14} aria-hidden="true" />
      Sair
    </button>
  )
}
