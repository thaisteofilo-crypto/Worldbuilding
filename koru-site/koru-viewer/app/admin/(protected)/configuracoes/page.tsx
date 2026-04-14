'use client'

import { useState, useEffect, useRef } from 'react'

export default function ConfiguracoesPage() {
  const [apiKey, setApiKey] = useState('')
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [savedPreview, setSavedPreview] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setConfigured(data.configured))
      .catch(() => setConfigured(false))
  }, [])

  function getInputValue(): string {
    if (inputRef.current) {
      return inputRef.current.value.trim()
    }
    return apiKey.trim()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    const keyValue = getInputValue()

    if (!keyValue) {
      setMessage({ type: 'error', text: 'Cole a chave no campo acima.' })
      return
    }

    if (!keyValue.startsWith('sk-ant-api03-')) {
      setMessage({ type: 'error', text: 'Chave invalida. Deve comecar com sk-ant-api03-. Chaves admin (sk-ant-admin) nao funcionam para a API.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyValue }),
      })
      const data = await res.json()

      if (res.ok) {
        const preview = keyValue.slice(0, 15) + '...' + keyValue.slice(-4)
        setSavedPreview(preview)
        setMessage({ type: 'success', text: `Chave salva: ${preview}. Reinicie o servidor para ativar.` })
        setConfigured(true)
        setApiKey('')
        if (inputRef.current) inputRef.current.value = ''
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexao com o servidor.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl" style={{ color: 'var(--foreground)' }}>
          Configuracoes
        </h1>
        <p className="mt-1 font-sans text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Gerencie as integracoes e chaves do projeto
        </p>
      </div>

      {/* API Key card */}
      <div className="rounded-xl p-6 glass-card">
        {/* Card header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="font-serif text-xl" style={{ color: 'var(--foreground)' }}>
                Chave de API
              </h2>
              {/* Status indicator */}
              {configured === null ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-sans text-[10px]"
                  style={{
                    color: 'var(--muted-foreground)',
                    background: 'color-mix(in oklch, var(--muted-foreground) 10%, transparent)',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--muted-foreground)' }} />
                  Verificando
                </span>
              ) : configured ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-sans text-[10px]"
                  style={{
                    color: 'oklch(0.65 0.15 150)',
                    background: 'color-mix(in oklch, oklch(0.65 0.15 150) 12%, transparent)',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'oklch(0.65 0.15 150)' }} />
                  Configurada
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-sans text-[10px]"
                  style={{
                    color: 'oklch(0.62 0.18 27)',
                    background: 'color-mix(in oklch, oklch(0.62 0.18 27) 12%, transparent)',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'oklch(0.62 0.18 27)' }} />
                  Nao configurada
                </span>
              )}
            </div>
            <p className="font-sans text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Anthropic API Key
            </p>
          </div>
          {/* API logo mark */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'color-mix(in oklch, var(--accent) 14%, transparent)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        {/* Saved preview */}
        {configured && savedPreview && (
          <div
            className="rounded-lg px-3 py-2 mb-5 font-mono text-xs"
            style={{
              background: 'color-mix(in oklch, var(--accent) 8%, transparent)',
              color: 'var(--accent)',
              border: '1px solid color-mix(in oklch, var(--accent) 20%, transparent)',
            }}
          >
            {savedPreview}
          </div>
        )}

        {/* Divider */}
        <div className="mb-5" style={{ borderTop: '1px solid var(--border)' }} />

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="api-key"
              className="block font-sans text-xs font-medium mb-2 uppercase tracking-[0.1em]"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {configured ? 'Substituir chave' : 'Inserir chave'}
            </label>
            <input
              ref={inputRef}
              id="api-key"
              type="text"
              defaultValue=""
              onChange={(e) => setApiKey(e.target.value)}
              onInput={(e) => setApiKey((e.target as HTMLInputElement).value)}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text')
                if (pasted) {
                  e.preventDefault()
                  const trimmed = pasted.trim()
                  setApiKey(trimmed)
                  if (inputRef.current) inputRef.current.value = trimmed
                }
              }}
              placeholder="sk-ant-api03-..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              data-1p-ignore
              data-lpignore="true"
              className="w-full rounded-lg px-4 py-2.5 font-mono text-sm transition-colors focus:outline-none"
              style={{
                background: 'var(--surface)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                caretColor: 'var(--accent)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid color-mix(in oklch, var(--accent) 50%, transparent)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid var(--border)'
              }}
            />
            <p className="mt-2 font-sans text-[11px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Necessaria para o chat IA no editor. Use uma chave que comece com{' '}
              <code
                className="rounded px-1 py-0.5 font-mono text-[10px]"
                style={{ background: 'color-mix(in oklch, var(--foreground) 8%, transparent)', color: 'var(--foreground)' }}
              >
                sk-ant-api03-
              </code>
              . A chave sera salva no .env.local e exige reinicio do servidor.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full px-6 py-2.5 font-sans text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-40"
              style={{
                background: 'var(--foreground)',
                color: 'var(--background)',
              }}
            >
              {saving ? 'Salvando...' : configured ? 'Substituir chave' : 'Salvar chave'}
            </button>
          </div>
        </form>

        {/* Message */}
        {message && (
          <div
            className="mt-5 rounded-lg px-4 py-3 font-sans text-sm"
            style={
              message.type === 'success'
                ? {
                    color: 'oklch(0.70 0.14 150)',
                    background: 'color-mix(in oklch, oklch(0.65 0.15 150) 10%, transparent)',
                    border: '1px solid color-mix(in oklch, oklch(0.65 0.15 150) 25%, transparent)',
                  }
                : {
                    color: 'oklch(0.70 0.16 27)',
                    background: 'color-mix(in oklch, oklch(0.62 0.18 27) 10%, transparent)',
                    border: '1px solid color-mix(in oklch, oklch(0.62 0.18 27) 25%, transparent)',
                  }
            }
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
