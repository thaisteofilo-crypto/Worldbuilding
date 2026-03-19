import type { AIFeature, Bible } from '@/types'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string

function buildSystemPrompt(bible: Bible): string {
  const chars = bible.characters.map(c => `- ${c.name} (${c.role}): ${c.description}`).join('\n')
  const locs = bible.locations.map(l => `- ${l.name} (${l.type}): ${l.description}`).join('\n')
  return `You are a creative writing assistant helping an author write fiction.

STORY BIBLE:
${chars ? `Characters:\n${chars}` : ''}
${locs ? `\nLocations:\n${locs}` : ''}
${bible.notes ? `\nNotes:\n${bible.notes}` : ''}

Always match the author's existing voice, tone and style. Write in the same language as the text provided. Be creative, literary and engaging. Never explain what you're doing — just write.`
}

function buildUserPrompt(feature: AIFeature, context: string, selected: string): string {
  switch (feature) {
    case 'write':
      return `Continue this story naturally from where it ends. Write the next 200-300 words in the same voice and style:\n\n${context}`
    case 'describe':
      return `Expand the following passage with rich sensory details (sight, sound, smell, touch, taste) that immerse the reader. Keep the same narrative voice and weave descriptions organically:\n\n${selected || context}`
    case 'brainstorm':
      return `Based on this story context, generate 3 compelling directions for what could happen next. Each should be a 2-3 sentence summary of a different narrative path (one dramatic, one unexpected, one character-focused):\n\n${context}`
    case 'rewrite':
      return `Rewrite the following passage in 3 different ways, each numbered. Keep the same meaning but vary the style, pacing or perspective:\n\n${selected || context}`
    case 'feedback':
      return `Give concise, actionable feedback on this passage. Focus on: 1) What's working well, 2) One specific thing to improve, 3) A suggestion for the next scene:\n\n${context}`
  }
}

export async function* streamClaudeResponse(
  feature: AIFeature,
  context: string,
  selectedText: string,
  bible: Bible,
  onError: (msg: string) => void
): AsyncGenerator<string> {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    onError('Adicione sua chave da API Claude em .env.local (VITE_ANTHROPIC_API_KEY)')
    return
  }

  const systemPrompt = buildSystemPrompt(bible)
  const userPrompt = buildUserPrompt(feature, context, selectedText)

  let response: Response
  try {
    response = await fetch('/api/claude/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        stream: true,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })
  } catch (e) {
    onError('Erro de conexão. Verifique sua internet.')
    return
  }

  if (!response.ok) {
    const err = await response.text()
    if (response.status === 401) {
      onError('API key inválida. Verifique VITE_ANTHROPIC_API_KEY em .env.local')
    } else {
      onError(`Erro ${response.status}: ${err.slice(0, 100)}`)
    }
    return
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]' || !data) continue

      try {
        const parsed = JSON.parse(data)
        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
          yield parsed.delta.text
        }
      } catch {
        // skip malformed chunks
      }
    }
  }
}
