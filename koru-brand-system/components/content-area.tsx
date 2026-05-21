import { MDXRemote } from 'next-mdx-remote/rsc'
import type { PageContent } from '@/lib/mdx'
import { mdxComponents } from './mdx-components'

interface Props {
  content: PageContent
}

export function ContentArea({ content }: Props) {
  return (
    <article className="max-w-3xl mx-auto px-8 py-12">
      <header className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          {content.section}
        </p>
        <h1 className="text-3xl font-semibold text-foreground">{content.title}</h1>
        {content.description && (
          <p className="mt-3 text-muted-foreground text-base leading-relaxed">
            {content.description}
          </p>
        )}
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none
        prose-headings:font-semibold
        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
        prose-p:leading-relaxed prose-p:text-foreground/90
        prose-code:font-mono prose-code:text-sm
        prose-pre:bg-surface prose-pre:border prose-pre:border-border
        prose-strong:text-foreground
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      ">
        <MDXRemote source={content.source} components={mdxComponents} />
      </div>
    </article>
  )
}
