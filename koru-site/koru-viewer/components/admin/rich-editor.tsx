'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { forwardRef, useImperativeHandle, useEffect } from 'react'
import type { Editor } from '@tiptap/react'

export interface RichEditorRef {
  editor: Editor | null
}

interface RichEditorProps {
  markdown: string
  documentKey: string
  onChange: (markdown: string) => void
  placeholder?: string
  focusMode?: boolean
}

// The @tiptap/markdown extension adds getMarkdown() directly to the editor instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMarkdownFromEditor(editor: Editor): string {
  return (editor as any).getMarkdown?.() ?? editor.getText()
}

// Set content parsed as markdown using the Markdown extension's command override
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setMarkdownContent(editor: Editor, markdown: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(editor.commands as any).setContent(markdown, { contentType: 'markdown' })
}

export const RichEditor = forwardRef<RichEditorRef, RichEditorProps>(
  function RichEditor({ markdown, documentKey, onChange, placeholder = 'Comece a escrever...', focusMode }, ref) {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Markdown,
      ],
      content: markdown,
      contentType: 'markdown',
      editorProps: {
        attributes: {
          class: 'koru-editor',
          spellcheck: 'false',
        },
      },
      onUpdate: ({ editor }) => {
        onChange(getMarkdownFromEditor(editor))
      },
      immediatelyRender: false,
    })

    useImperativeHandle(ref, () => ({ editor: editor ?? null }), [editor])

    // Reset quando o documento muda
    useEffect(() => {
      if (editor) {
        setMarkdownContent(editor, markdown)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentKey])

    if (!editor) return null

    return (
      <div className={`relative flex-1 flex flex-col min-h-0${focusMode ? ' koru-editor-focus' : ''}`}>
        <EditorContent
          editor={editor}
          className="flex-1 overflow-y-auto"
          style={focusMode ? {
            background: 'transparent',
            border: 'none',
            borderRadius: '0',
          } : {
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
          }}
        />

        {editor.isEmpty && (
          <div
            className="absolute pointer-events-none font-sans select-none"
            style={{
              top: focusMode ? '2rem' : '1.5rem',
              left: '2rem',
              color: 'var(--muted-foreground)',
              opacity: 0.3,
              fontSize: focusMode ? '17px' : '15px',
            }}
          >
            {placeholder}
          </div>
        )}

        <style>{`
          .koru-editor {
            outline: none;
            font-family: var(--font-sans), Inter, sans-serif;
            font-size: 15px;
            line-height: 1.95;
            color: var(--foreground);
            padding: 2.5rem 2rem;
            min-height: 100%;
            caret-color: var(--foreground);
          }

          .koru-editor-focus .koru-editor {
            font-size: 17px;
            line-height: 1.85;
            padding: 2rem 2rem 6rem;
            color: color-mix(in oklch, var(--foreground) 92%, transparent);
          }

          .koru-editor p {
            margin: 0 0 1.1rem;
          }

          .koru-editor p:last-child {
            margin-bottom: 0;
          }

          .koru-editor-focus .koru-editor p {
            margin: 0 0 1.5rem;
          }

          .koru-editor h1 {
            font-family: var(--font-serif), Georgia, serif;
            font-size: 1.6rem;
            line-height: 1.3;
            margin: 2rem 0 0.75rem;
            font-weight: 400;
          }

          .koru-editor h2 {
            font-family: var(--font-serif), Georgia, serif;
            font-size: 1.25rem;
            line-height: 1.4;
            margin: 1.75rem 0 0.5rem;
            font-weight: 400;
          }

          .koru-editor h3 {
            font-family: var(--font-serif), Georgia, serif;
            font-size: 1.05rem;
            line-height: 1.4;
            margin: 1.5rem 0 0.4rem;
            font-weight: 400;
          }

          .koru-editor-focus .koru-editor h1 {
            font-size: 1.8rem;
            margin: 3rem 0 1rem;
          }

          .koru-editor-focus .koru-editor h2 {
            font-size: 1.35rem;
            margin: 2.5rem 0 0.75rem;
          }

          .koru-editor-focus .koru-editor h3 {
            font-size: 1.1rem;
            margin: 2rem 0 0.6rem;
          }

          .koru-editor blockquote {
            border-left: 2px solid var(--accent);
            margin: 1.25rem 0;
            padding: 0.25rem 0 0.25rem 1.25rem;
            color: color-mix(in oklch, var(--foreground) 65%, transparent);
            font-style: italic;
          }

          .koru-editor ul,
          .koru-editor ol {
            margin: 0.75rem 0;
            padding-left: 1.5rem;
          }

          .koru-editor li {
            margin: 0.25rem 0;
            line-height: 1.7;
          }

          .koru-editor hr {
            border: none;
            border-top: 1px solid color-mix(in oklch, var(--border) 60%, transparent);
            margin: 2rem 0;
          }

          .koru-editor strong {
            font-weight: 600;
          }

          .koru-editor em {
            font-style: italic;
          }

          .koru-editor code {
            font-family: monospace;
            font-size: 0.875em;
            background: color-mix(in oklch, var(--foreground) 8%, transparent);
            padding: 0.1em 0.35em;
            border-radius: 0.25rem;
          }

          .koru-editor pre {
            background: color-mix(in oklch, var(--foreground) 6%, transparent);
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1rem 0;
          }

          .koru-editor pre code {
            background: none;
            padding: 0;
            font-size: 0.8rem;
          }

          .koru-editor img {
            max-width: 100%;
            border-radius: 0.75rem;
            margin: 1rem 0;
          }

          .koru-editor ::selection {
            background: color-mix(in oklch, var(--accent) 25%, transparent);
          }
        `}</style>
      </div>
    )
  }
)
