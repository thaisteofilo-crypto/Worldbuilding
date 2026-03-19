import { useEffect, useRef, useCallback } from 'react'
import { ScrollArea } from '@overlens/legacy-components'
import { useStore } from '@/store/useStore'

export function Editor() {
  const { activeDocument, updateDocumentContent, setSelectedText } = useStore()
  const doc = activeDocument()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  const resize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(el.scrollHeight, 600) + 'px'
  }, [])

  useEffect(() => {
    resize()
  }, [doc?.content, resize])

  // Track selected text for AI features
  const handleSelect = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    const selected = el.value.slice(el.selectionStart, el.selectionEnd).trim()
    setSelectedText(selected)
  }, [setSelectedText])

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Selecione um documento na barra lateral
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="min-h-full px-4 py-8 max-w-3xl mx-auto">
        {/* Document title */}
        <input
          value={doc.title}
          onChange={e => useStore.getState().updateDocumentTitle(doc.id, e.target.value)}
          className="w-full text-2xl font-heading font-semibold text-foreground bg-transparent border-0 outline-none mb-6 placeholder:text-muted-foreground/40"
          placeholder="Título do documento..."
        />

        {/* Editor */}
        <textarea
          ref={textareaRef}
          value={doc.content}
          onChange={e => {
            updateDocumentContent(doc.id, e.target.value)
            resize()
          }}
          onSelect={handleSelect}
          onKeyUp={handleSelect}
          onMouseUp={handleSelect}
          placeholder="Comece a escrever sua história aqui...

Selecione qualquer trecho de texto e use os botões na barra superior para acionar recursos de IA (Escrever, Descrever, Brainstorm, Reescrever, Feedback)."
          className="w-full resize-none bg-transparent border-0 outline-none text-base leading-relaxed text-foreground font-body placeholder:text-muted-foreground/30 min-h-[600px]"
          style={{ lineHeight: '1.8', letterSpacing: '0.01em' }}
        />
      </div>
    </ScrollArea>
  )
}
