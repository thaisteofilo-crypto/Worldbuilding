'use client'

import { useState, useEffect, useRef } from 'react'

type Provider = 'anthropic' | 'gemma'

interface ProviderConfig {
  id: Provider
  title: string
  subtitle: string
  placeholder: string
  helpText: React.ReactNode
  validate: (key: string) => string | null
  supportsTest: boolean
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  anthropic: {
    id: 'anthropic',
    title: 'Anthropic',
    subtitle: 'Chat IA do editor (Claude)',
    placeholder: 'sk-ant-api03-...',
    helpText: (
      <>
        Pegue em <code className="font-mono text-[10px] rounded px-1 py-0.5" style={{ background: 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}>console.anthropic.com</code>.
        Deve começar com <code className="font-mono text-[10px] rounded px-1 py-0.5" style={{ background: 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}>sk-ant-api03-</code>.
      </>
    ),
    validate: (k) => (k.startsWith('sk-ant-api03-') ? null : 'Chave inválida. Deve começar com sk-ant-api03-.'),
    supportsTest: true,
  },
  gemma: {
    id: 'gemma',
    title: 'Gemma (Google AI)',
    subtitle: 'Chatbot público do mundo',
    placeholder: 'AIza...',
    helpText: (
      <>
        Pegue em <code className="font-mono text-[10px] rounded px-1 py-0.5" style={{ background: 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}>aistudio.google.com/apikey</code>.
        Deve começar com <code className="font-mono text-[10px] rounded px-1 py-0.5" style={{ background: 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}>AIza</code>.
      </>
    ),
    validate: (k) => (/^AIza[0-9A-Za-z_-]{20,}$/.test(k) ? null : 'Chave inválida. Pegue em aistudio.google.com/apikey (formato AIza...).'),
    supportsTest: false,
  },
}

function ApiKeyCard({
  provider,
  configured,
  onSaved,
}: {
  provider: Provider
  configured: boolean | null
  onSaved: () => void
}) {
  const config = PROVIDERS[provider]
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [savedPreview, setSavedPreview] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const keyValue = inputRef.current?.value.trim() ?? ''
    if (!keyValue) {
      setMessage({ type: 'error', text: 'Cole a chave no campo acima.' })
      return
    }
    const validation = config.validate(keyValue)
    if (validation) {
      setMessage({ type: 'error', text: validation })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyValue, provider: config.id }),
      })
      const data = await res.json()
      if (res.ok) {
        const preview = keyValue.slice(0, 10) + '...' + keyValue.slice(-4)
        setSavedPreview(preview)
        setMessage({ type: 'success', text: `Chave salva: ${preview}. Reinicie o servidor para ativar.` })
        if (inputRef.current) inputRef.current.value = ''
        onSaved()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/settings/test', { method: 'POST' })
      const data = await res.json()
      setTestResult(data)
    } catch {
      setTestResult({ ok: false, error: 'Erro de conexão com o servidor.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="rounded-xl p-6 glass-card">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="font-serif text-xl" style={{ color: 'var(--foreground)' }}>
              {config.title}
            </h2>
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
                Não configurada
              </span>
            )}
          </div>
          <p className="font-sans text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {config.subtitle}
          </p>
        </div>
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

      <div className="mb-5" style={{ borderTop: '1px solid var(--border)' }} />

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor={`api-key-${config.id}`}
            className="block font-sans text-xs font-medium mb-2 uppercase tracking-[0.1em]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {configured ? 'Substituir chave' : 'Inserir chave'}
          </label>
          <input
            ref={inputRef}
            id={`api-key-${config.id}`}
            type="text"
            defaultValue=""
            placeholder={config.placeholder}
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
            {config.helpText} A chave é salva no <code className="font-mono text-[10px]">.env.local</code> e exige reinício do servidor.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
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

          {configured && config.supportsTest && (
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="rounded-full px-6 py-2.5 font-sans text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-40"
              style={{
                background: 'color-mix(in oklch, var(--foreground) 10%, transparent)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            >
              {testing ? 'Testando...' : 'Testar conexão'}
            </button>
          )}

          {testResult !== null && (
            <span
              className="flex items-center gap-1.5 font-sans text-sm"
              style={{ color: testResult.ok ? 'oklch(0.65 0.15 150)' : 'oklch(0.70 0.16 27)' }}
            >
              {testResult.ok ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2 7 6 11 12 3" />
                  </svg>
                  Conexão OK
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="2" y1="2" x2="12" y2="12" />
                    <line x1="12" y1="2" x2="2" y2="12" />
                  </svg>
                  {testResult.error ?? 'Erro desconhecido'}
                </>
              )}
            </span>
          )}
        </div>
      </form>

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
  )
}

export default function ConfiguracoesPage() {
  const [status, setStatus] = useState<{ anthropic: boolean | null; gemma: boolean | null }>({
    anthropic: null,
    gemma: null,
  })

  function loadStatus() {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setStatus({ anthropic: !!data.anthropic, gemma: !!data.gemma }))
      .catch(() => setStatus({ anthropic: false, gemma: false }))
  }

  useEffect(() => {
    loadStatus()
  }, [])

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl" style={{ color: 'var(--foreground)' }}>
          Configurações
        </h1>
        <p className="mt-1 font-sans text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Gerencie as integrações e chaves do projeto
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <ApiKeyCard provider="anthropic" configured={status.anthropic} onSaved={loadStatus} />
        <ApiKeyCard provider="gemma" configured={status.gemma} onSaved={loadStatus} />
      </div>
    </div>
  )
}
