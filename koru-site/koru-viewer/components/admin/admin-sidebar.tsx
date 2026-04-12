'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/admin/documents',
    label: 'Documentos',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: '/admin/characters',
    label: 'Personagens',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/admin/banners',
    label: 'Banners',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    href: '/admin/card-images',
    label: 'Imagens dos Cards',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
        <line x1="15" y1="3" x2="15" y2="9" />
        <line x1="12" y1="6" x2="18" y2="6" />
      </svg>
    ),
  },
  {
    href: '/admin/gallery',
    label: 'Galeria',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
        <line x1="17" y1="17" x2="22" y2="17" />
      </svg>
    ),
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex w-56 flex-col border-r glass"
      style={{
        borderColor: 'var(--border)',
      }}
    >
      <div
        className="flex h-12 items-center border-b px-5"
        style={{ borderColor: 'var(--border)' }}
      >
        <span
          className="font-serif text-lg"
          style={{ color: 'var(--foreground)' }}
        >
          Korú
        </span>
        <span
          className="ml-2 rounded-full px-1.5 py-0.5 font-sans text-[9px] tracking-[0.15em] uppercase"
          style={{
            color: 'var(--foreground)',
            border: '1px solid color-mix(in oklch, var(--foreground) 30%, transparent)',
            background: 'color-mix(in oklch, var(--foreground) 10%, transparent)',
          }}
        >
          Admin
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-3 pt-5">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-sans text-sm transition-all duration-150',
              )}
              style={
                active
                  ? {
                      background: 'color-mix(in oklch, var(--foreground) 8%, transparent)',
                      color: 'var(--foreground)',
                      fontWeight: 500,
                    }
                  : {
                      color: 'var(--muted-foreground)',
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 6%, transparent)'
                  e.currentTarget.style.color = 'var(--foreground)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--muted-foreground)'
                }
              }}
            >
              <span style={{ opacity: active ? 1 : 0.5 }}>{item.icon}</span>
              {item.label}
              {active && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--foreground)' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div
        className="mt-auto border-t p-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <LogoutButton />
      </div>
    </aside>
  )
}

function LogoutButton() {
  function handleLogout() {
    document.cookie = 'koru-admin=; path=/; max-age=0'
    window.location.href = '/admin/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 font-sans text-xs transition-all duration-150"
      style={{ color: 'var(--muted-foreground)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 6%, transparent)'
        e.currentTarget.style.color = 'var(--foreground)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--muted-foreground)'
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Sair
    </button>
  )
}
