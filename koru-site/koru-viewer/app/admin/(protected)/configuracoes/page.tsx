'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
} from '@/components/ui/glass-card'
import { Lock, Check, X } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [apiKey, setApiKey] = useState('')
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [savedPreview, setSavedPreview] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null)
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

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/settings/test', { method: 'POST' })
      const data = await res.json()
      setTestResult(data)
    } catch {
      setTestResult({ ok: false, error: 'Erro de conexao com o servidor.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground">
          Configuracoes
        </h1>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Gerencie as integracoes e chaves do projeto
        </p>
      </div>

      {/* API Key card */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <GlassCardTitle className="font-serif text-xl text-foreground">
                  Chave de API
                </GlassCardTitle>
                {/* Status indicator */}
                {configured === null ? (
                  <Skeleton className="h-5 w-20 rounded-full" />
                ) : configured ? (
                  <Badge variant="outline" className="gap-1.5 text-[10px]" style={{ color: 'oklch(0.65 0.15 150)', borderColor: 'oklch(0.65 0.15 150 / 0.4)', background: 'oklch(0.65 0.15 150 / 0.12)' }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'oklch(0.65 0.15 150)' }} />
                    Configurada
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1.5 text-[10px]" style={{ color: 'var(--destructive)', borderColor: 'color-mix(in oklch, var(--destructive) 40%, transparent)', background: 'color-mix(in oklch, var(--destructive) 10%, transparent)' }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    Nao configurada
                  </Badge>
                )}
              </div>
              <GlassCardDescription className="font-sans text-xs">
                Anthropic API Key
              </GlassCardDescription>
            </div>
            {/* API logo mark */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in oklch, hsl(var(--primary)) 14%, transparent)' }}
            >
              <Lock size={16} style={{ color: 'hsl(var(--primary))' }} />
            </div>
          </div>
        </GlassCardHeader>

        <GlassCardContent className="flex flex-col gap-4">
          {/* Saved preview */}
          {configured && savedPreview && (
            <div
              className="rounded-lg px-3 py-2 font-mono text-xs"
              style={{
                background: 'color-mix(in oklch, hsl(var(--primary)) 8%, transparent)',
                color: 'hsl(var(--primary))',
                border: '1px solid color-mix(in oklch, hsl(var(--primary)) 20%, transparent)',
              }}
            >
              {savedPreview}
            </div>
          )}

          <Separator />

          {/* Form */}
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <Label
                htmlFor="api-key"
                className="font-sans text-xs font-medium mb-2 uppercase tracking-[0.1em] text-muted-foreground"
              >
                {configured ? 'Substituir chave' : 'Inserir chave'}
              </Label>
              <Input
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
                className="mt-1 font-mono text-sm"
              />
              <p className="mt-2 font-sans text-[11px] leading-relaxed text-muted-foreground">
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

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Salvando...' : configured ? 'Substituir chave' : 'Salvar chave'}
              </Button>

              {configured && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTest}
                  disabled={testing}
                >
                  {testing ? 'Testando...' : 'Testar conexao'}
                </Button>
              )}

              {testResult !== null && (
                <span
                  className="flex items-center gap-1.5 font-sans text-sm"
                  style={{ color: testResult.ok ? 'oklch(0.65 0.15 150)' : 'var(--destructive)' }}
                >
                  {testResult.ok ? (
                    <>
                      <Check size={14} />
                      Conexao OK
                    </>
                  ) : (
                    <>
                      <X size={14} />
                      {testResult.error ?? 'Erro desconhecido'}
                    </>
                  )}
                </span>
              )}
            </div>
          </form>

          {/* Message */}
          {message && (
            <div
              className="rounded-lg px-4 py-3 font-sans text-sm"
              style={
                message.type === 'success'
                  ? {
                      color: 'oklch(0.70 0.14 150)',
                      background: 'color-mix(in oklch, oklch(0.65 0.15 150) 10%, transparent)',
                      border: '1px solid color-mix(in oklch, oklch(0.65 0.15 150) 25%, transparent)',
                    }
                  : {
                      color: 'var(--destructive)',
                      background: 'color-mix(in oklch, var(--destructive) 10%, transparent)',
                      border: '1px solid color-mix(in oklch, var(--destructive) 25%, transparent)',
                    }
              }
            >
              {message.text}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  )
}
