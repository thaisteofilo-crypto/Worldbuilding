'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard, Users, Image, Monitor, Images,
  Pencil, FileEdit, Lock, MessageCircle, Settings, X, LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', exact: true, icon: <LayoutDashboard size={16} /> },
  { href: '/admin/characters', label: 'Personagens', icon: <Users size={16} /> },
  { href: '/admin/banners', label: 'Banners da Homepage', icon: <Image size={16} /> },
  { href: '/admin/card-images', label: 'Cards', icon: <Monitor size={16} /> },
  { href: '/admin/gallery', label: 'Galeria de Arte', icon: <Images size={16} /> },
  { href: '/admin/conteudo', label: 'Conteúdo', icon: <Pencil size={16} /> },
  { href: '/admin/editor', label: 'Editor', icon: <FileEdit size={16} /> },
  { href: '/admin/publicacao', label: 'Publicação', icon: <Lock size={16} /> },
  { href: '/admin/conversas', label: 'Conversas', icon: <MessageCircle size={16} /> },
  { href: '/admin/configuracoes', label: 'Configurações', icon: <Settings size={16} /> },
]

interface AdminSidebarProps {
  open?: boolean
  onClose?: () => void
}

export function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  // Auto-close mobile drawer on route change
  useEffect(() => {
    onClose?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Lock body scroll when mobile drawer is open
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
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-label="Navegação principal"
        aria-modal={open || undefined}
        className={cn(
          'flex w-56 flex-col bg-background',
          // Mobile: off-canvas drawer
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl tracking-tight text-foreground">
              Korú
            </span>
            <Badge variant="outline" className="rounded-full font-sans text-[9px] tracking-[0.15em] uppercase">
              Admin
            </Badge>
          </div>
          {/* Mobile close */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={16} aria-hidden="true" />
          </Button>
        </div>

        {/* Nav */}
        <nav aria-label="Menu" className="flex flex-col gap-0.5 p-3 pt-4 flex-1 overflow-y-auto">
          {navItems.map((item) => {
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
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-sans text-sm transition-all duration-150',
                  active
                    ? 'bg-admin-active text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-admin-hover hover:text-foreground',
                )}
              >
                <span aria-hidden="true" className={active ? 'opacity-100' : 'opacity-45'}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
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
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="w-full justify-start gap-2.5 rounded-lg font-sans text-xs text-muted-foreground"
    >
      <LogOut size={14} aria-hidden="true" />
      Sair
    </Button>
  )
}
