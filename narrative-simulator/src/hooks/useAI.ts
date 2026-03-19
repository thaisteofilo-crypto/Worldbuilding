import { useStore } from '@/store/useStore'
import { streamClaudeResponse } from '@/services/claude'
import type { AIFeature } from '@/types'

export function useAI() {
  const store = useStore()

  const run = async (feature: AIFeature) => {
    const doc = store.activeDocument()
    const project = store.activeProject()
    if (!doc || !project) return

    // Context: last ~2000 chars of document
    const context = doc.content.slice(-2000)
    const selected = store.selectedText

    store.setGenerating(true)
    store.setError(null)
    store.setRightPanelTab('history')

    const cardId = store.addCard({
      feature,
      prompt: selected || context.slice(-300),
      response: '',
      streaming: true,
      documentId: doc.id,
    })

    let full = ''
    const gen = streamClaudeResponse(
      feature,
      context,
      selected,
      project.bible,
      (msg) => store.setError(msg)
    )

    for await (const chunk of gen) {
      full += chunk
      store.updateCard(cardId, { response: full })
    }

    store.updateCard(cardId, { streaming: false })
    store.setGenerating(false)
  }

  return { run }
}
