import type { MDXComponents } from 'mdx/types'

export const mdxComponents: MDXComponents = {
  // Color swatch component
  ColorSwatch: ({ name, value, label }: { name: string; value: string; label?: string }) => (
    <div className="inline-flex flex-col items-center gap-1.5 mr-4 mb-4">
      <div
        className="w-16 h-16 rounded-xl border border-border shadow-sm"
        style={{ background: value }}
        title={value}
      />
      <span className="text-xs font-mono text-muted-foreground">{name}</span>
      {label && <span className="text-xs text-foreground/60">{label}</span>}
    </div>
  ),

  // Callout component
  Callout: ({ type = 'info', children }: { type?: 'info' | 'warning' | 'tip'; children: React.ReactNode }) => {
    const styles = {
      info: 'border-primary/30 bg-primary/5 text-foreground',
      warning: 'border-gold/30 bg-gold/5 text-foreground',
      tip: 'border-blue-cold/30 bg-blue-cold/5 text-foreground',
    }
    return (
      <div className={`my-6 rounded-xl border px-5 py-4 text-sm leading-relaxed ${styles[type]}`}>
        {children}
      </div>
    )
  },
}
