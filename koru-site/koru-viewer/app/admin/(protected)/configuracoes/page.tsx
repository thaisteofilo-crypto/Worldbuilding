'use client'

import { useState, useEffect } from 'react'

export default function ConfiguracoesPage() {
  const [apiKey, setApiKey] = useState('')
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setConfigured(data.configured))
      .catch(() => setConfigured(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        setConfigured(true)
        setApiKey('')
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar a chave.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 p-8 font-sans">
      <h1 className="text-2xl font-semibold text-black mb-1">Configurações</h1>
      <p className="text-sm text-neutral-500 mb-8">Gerencie as configurações do projeto.</p>

      <div className="max-w-lg rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-base font-medium text-black mb-1">Anthropic API Key</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Necessária para funcionalidades de IA do projeto.
        </p>

        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Status:</span>
          {configured === null ? (
            <span className="text-xs text-neutral-400">Verificando...</span>
          ) : configured ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-black">
              <span className="h-2 w-2 rounded-full bg-black" />
              Configurada
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-neutral-300" />
              Não configurada
            </span>
          )}
        </div>

        <form onSubmit={handleSave}>
          <label htmlFor="api-key" className="block text-sm font-medium text-black mb-1.5">
            {configured ? 'Substituir chave' : 'Inserir chave'}
          </label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          <p className="mt-1.5 text-xs text-neutral-400">
            A chave será salva no arquivo .env.local. O servidor precisa ser reiniciado após a alteração.
          </p>

          <button
            type="submit"
            disabled={saving || !apiKey.trim()}
            className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 rounded-md border px-3 py-2 text-sm ${
              message.type === 'success'
                ? 'border-neutral-300 bg-neutral-50 text-black'
                : 'border-neutral-300 bg-neutral-50 text-black'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
