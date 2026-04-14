'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { forwardRef, useImperativeHandle, useEffect, useRef, useState, useCallback } from 'react'
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
  onAutoSave?: (content: string) => Promise<void>
}

type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved'

const MARKDOWN_SHORTCUTS = [
  { syntax: '# Título 1',    description: 'Heading 1' },
  { syntax: '## Título 2',   description: 'Heading 2' },
  { syntax: '**negrito**',   description: 'Negrito' },
  { syntax: '_itálico_',     description: 'Itálico' },
  { syntax: '---',           description: 'Divisor' },
  { syntax: '> citação',     description: 'Citação' },
]

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
  function RichEditor({ markdown, documentKey, onChange, placeholder = 'Comece a escrever...', focusMode, onAutoSave }, ref) {
    // --- Autosave state ---
    const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle')
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // --- Word/char count state ---
    const [wordCount, setWordCount] = useState(0)
    const [charCount, setCharCount] = useState(0)

    // --- Shortcuts popover state ---
    const [showShortcuts, setShowShortcuts] = useState(false)
    const shortcutsRef = useRef<HTMLDivElement>(null)

    // Close shortcuts popover on outside click or Escape
    useEffect(() => {
      if (!showShortcuts) return

      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') setShowShortcuts(false)
      }
      function handleClickOutside(e: MouseEvent) {
        if (shortcutsRef.current && !shortcutsRef.current.contains(e.target as Node)) {
          setShowShortcuts(false)
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [showShortcuts])

    // Cleanup timers on unmount
    useEffect(() => {
      return () => {
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      }
    }, [])

    const triggerAutoSave = useCallback((content: string) => {
      if (!onAutoSave) return

      // Clear any pending timers
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)

      setAutoSaveStatus('pending')

      autoSaveTimerRef.current = setTimeout(async () => {
        setAutoSaveStatus('saving')
        try {
          await onAutoSave(content)
          setAutoSaveStatus('saved')
          hideTimerRef.current = setTimeout(() => {
            setAutoSaveStatus('idle')
          }, 3000)
        } catch {
          setAutoSaveStatus('idle')
        }
      }, 2500)
    }, [onAutoSave])

    const updateCounts = useCallback((editorInstance: Editor) => {
      const text = editorInstance.getText()
      const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length
      setWordCount(words)
      setCharCount(text.length)
    }, [])

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
        const content = getMarkdownFromEditor(editor)
        onChange(content)
        triggerAutoSave(content)
        updateCounts(editor)
      },
      onCreate: ({ editor }) => {
        updateCounts(editor)
      },
      immediatelyRender: false,
    })

    useImperativeHandle(ref, () => ({ editor: editor ?? null }), [editor])

    // Reset quando o documento muda
    useEffect(() => {
      if (editor) {
        setMarkdownContent(editor, markdown)
        updateCounts(editor)
        // Reset autosave state when switching documents
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        setAutoSaveStatus('idle')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentKey])

    if (!editor) return null

    const autoSaveLabel =
      autoSaveStatus === 'pending' ? '...' :
      autoSaveStatus === 'saving'  ? 'salvando' :
      autoSaveStatus === 'saved'   ? 'salvo \u2713' :
      null

    return (
      <div className={`relative flex-1 flex flex-col min-h-0${focusMode ? ' koru-editor-focus' : ''}`}>
        {/* Bottom meta bar: word count + autosave + shortcuts help */}
        <div
          className="flex items-center justify-between px-2 py-1 select-none"
          style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}
        >
          {/* Word / char counter */}
          <span className="font-mono">
            {wordCount} palavras &middot; {charCount} chars
          </span>

          <div className="flex items-center gap-3">
            {/* Autosave indicator */}
            {onAutoSave && autoSaveLabel && (
              <span
                className="font-mono transition-opacity duration-300"
                style={{ opacity: autoSaveStatus === 'idle' ? 0 : 1 }}
              >
                {autoSaveLabel}
              </span>
            )}

            {/* Shortcuts help button */}
            <div ref={shortcutsRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowShortcuts(v => !v)}
                className="flex items-center justify-center rounded transition-colors"
                style={{
                  width: '16px',
                  height: '16px',
                  fontSize: '10px',
                  border: '1px solid var(--border)',
                  color: 'var(--muted-foreground)',
                  background: 'transparent',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
                aria-label="Atalhos markdown"
              >
                ?
              </button>

              {showShortcuts && (
                <div
                  className="glass-card rounded-xl"
                  style={{
                    position: 'absolute',
                    bottom: '22px',
                    right: 0,
                    zIndex: 50,
                    padding: '0.75rem 1rem',
                    minWidth: '200px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}
                >
                  <p
                    className="font-sans uppercase"
                    style={{
                      fontSize: '9px',
                      letterSpacing: '0.15em',
                      color: 'var(--muted-foreground)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Atalhos Markdown
                  </p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {MARKDOWN_SHORTCUTS.map(({ syntax, description }) => (
                      <li key={syntax} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <code
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: 'var(--accent)',
                            background: 'color-mix(in oklch, var(--accent) 10%, transparent)',
                            padding: '0.05em 0.3em',
                            borderRadius: '0.2rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {syntax}
                        </code>
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'var(--muted-foreground)',
                          }}
                        >
                          {description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

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
              top: focusMode ? '3.5rem' : '3rem',
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
