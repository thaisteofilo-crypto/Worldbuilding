'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Search, Folder, Network, Bookmark, Plus,
  ChevronRight, ChevronDown, PanelLeftClose, X, LogOut,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/admin/escrever', label: 'Escrever' },
  { href: '/admin/homepage', label: 'Homepage' },
  { href: '/admin/conteudo', label: 'Conteúdo' },
  { href: '/admin/editor', label: 'Editor' },
  { href: '/admin/publicacao', label: 'Publicação' },
  { href: '/admin/characters', label: 'Personagens' },
  { href: '/admin/gallery', label: 'Galeria' },
  { href: '/admin/banners', label: 'Banners' },
  { href: '/admin/card-images', label: 'Cards' },
]

const sistemaItems = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/conversas', label: 'Conversas' },
  { href: '/admin/configuracoes', label: 'Configurações' },
]

const quickActions = [
  { href: '/admin/conteudo', label: 'Conteúdo', icon: Folder },
  { href: '/admin/characters', label: 'Personagens', icon: Network },
  { href: '/admin/publicacao', label: 'Publicação', icon: Bookmark },
]

interface AdminSidebarProps {
  open?: boolean
  onClose?: () => void
}

export function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const [sistemaOpen, setSistemaOpen] = useState(false)

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
          'flex w-64 flex-col bg-background',
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <h1 className="font-serif text-2xl leading-none text-una">
            Korú <span className="italic">Admin</span>
          </h1>
          <button
            onClick={onClose}
            className="text-iara/60 hover:text-iara transition-colors lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
          <button
            className="hidden lg:inline-flex text-iara/60 hover:text-iara transition-colors"
            aria-label="Recolher menu"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-4">
          <div className="relative">
            <Search size={14} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-iara" />
            <input
              type="search"
              placeholder="Buscar..."
              aria-label="Buscar no admin"
              className="w-full rounded-full border border-iara/20 bg-white pl-9 pr-14 py-2 font-sans text-sm text-una placeholder:text-pego outline-none transition-colors focus:border-iara focus:ring-2 focus:ring-iara/15"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md border border-iara/20 bg-white px-1.5 py-0.5 font-mono text-[10px] text-pego">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="px-5 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {quickActions.map((qa) => {
              const Icon = qa.icon
              return (
                <Link
                  key={qa.href}
                  href={qa.href}
                  aria-label={qa.label}
                  title={qa.label}
                  className="text-iara/70 hover:text-iara transition-colors"
                >
                  <Icon size={16} aria-hidden="true" />
                </Link>
              )
            })}
          </div>
          <Link
            href="/admin/editor"
            aria-label="Novo"
            title="Novo"
            className="text-iara/70 hover:text-iara transition-colors"
          >
            <Plus size={16} aria-hidden="true" />
          </Link>
        </div>

        {/* Nav */}
        <nav aria-label="Menu" className="flex-1 overflow-y-auto px-5 pb-4">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center justify-between py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors',
                  active ? 'text-una' : 'text-iara hover:text-una',
                )}
              >
                <span>{item.label}</span>
                <ChevronRight
                  size={12}
                  aria-hidden="true"
                  className={active ? 'text-una' : 'text-iara/50'}
                />
              </Link>
            )
          })}

          {/* Sistema group */}
          <div className="mt-2 border-t border-iara/10 pt-2">
            <button
              onClick={() => setSistemaOpen((v) => !v)}
              className="flex w-full items-center justify-between py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-iara hover:text-una transition-colors"
              aria-expanded={sistemaOpen}
            >
              <span className="flex items-center gap-2">
                <Settings size={12} aria-hidden="true" />
                Sistema
              </span>
              <ChevronDown
                size={12}
                aria-hidden="true"
                className={cn('transition-transform duration-200', sistemaOpen ? 'rotate-180' : '')}
              />
            </button>

            {sistemaOpen && (
              <div className="pl-4">
                {sistemaItems.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center justify-between py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors',
                        active ? 'text-una' : 'text-iara hover:text-una',
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronRight
                        size={12}
                        aria-hidden="true"
                        className={active ? 'text-una' : 'text-iara/50'}
                      />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2">
          <LogoutButton />
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
      className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-pego hover:text-urucum transition-colors"
    >
      <LogOut size={12} aria-hidden="true" />
      Sair
    </button>
  )
}
