import Link from 'next/link'
import { getSections } from '@/lib/mdx'

const SECTION_LABELS: Record<string, string> = {
  identidade: 'Identidade',
  cores: 'Cores',
  tipografia: 'Tipografia',
  voz: 'Voz & Tom',
  iconografia: 'Iconografia',
  componentes: 'Componentes',
  uso: 'Uso & Misuso',
}

export async function Sidebar() {
  const sections = await getSections()

  return (
    <aside className="w-64 shrink-0 h-screen overflow-y-auto border-r border-sidebar-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <span className="text-sm font-mono tracking-widest uppercase text-muted-foreground">Korú</span>
        <h1 className="text-base font-semibold text-sidebar-foreground mt-0.5">Brand System</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {sections.map(({ section, pages }) => (
          <div key={section}>
            <p className="px-3 mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {SECTION_LABELS[section] ?? section}
            </p>
            <ul className="space-y-0.5">
              {pages.map((page) => (
                <li key={page.page}>
                  <Link
                    href={`/${page.section}/${page.page}`}
                    className="koru-nav-item flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground font-mono">v0.1.0 · stage</p>
      </div>
    </aside>
  )
}
