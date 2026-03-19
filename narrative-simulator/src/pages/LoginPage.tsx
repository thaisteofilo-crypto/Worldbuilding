import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Label, Card, CardContent } from '@overlens/legacy-components'
import { useStore } from '@/store/useStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useStore(s => s.login)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  function validate(): boolean {
    const next: { name?: string; email?: string } = {}
    if (!name.trim()) next.name = 'Nome é obrigatório'
    if (!email.trim()) next.email = 'E-mail é obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'Insira um e-mail válido'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    login(name.trim(), email.trim())
    navigate('/projects')
  }

  function handleDemo() {
    login('Thais', 'thais@demo.com')
    navigate('/projects')
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Subtle radial gradient background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(120,80,200,0.12) 0%, rgba(0,0,0,0) 70%)',
        }}
      />

      {/* Decorative grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo / brand area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 mb-5 shadow-lg shadow-violet-900/40">
            <span className="text-white text-2xl font-black tracking-tight select-none">N</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight leading-tight">
            Narrative Simulator
          </h1>
          <p className="mt-2 text-sm text-neutral-400 font-medium">
            Sua ferramenta de escrita com IA
          </p>
        </div>

        <Card className="bg-neutral-950 border border-neutral-800 shadow-2xl shadow-black/60">
          <CardContent className="pt-6 pb-6 px-6">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {/* Name field */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-name" className="text-neutral-300 text-sm font-medium">
                  Seu nome
                </Label>
                <Input
                  id="login-name"
                  type="text"
                  placeholder="Como devo te chamar?"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                  }}
                  className={`bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 focus-visible:ring-violet-500 focus-visible:border-violet-500 ${
                    errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  autoComplete="off"
                  autoFocus
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-0.5">{errors.name}</p>
                )}
              </div>

              {/* Email field */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-email" className="text-neutral-300 text-sm font-medium">
                  E-mail
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
                  }}
                  className={`bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 focus-visible:ring-violet-500 focus-visible:border-violet-500 ${
                    errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-0.5">{errors.email}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold mt-1 transition-colors shadow-lg shadow-violet-900/30"
              >
                Entrar
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-neutral-800" />
              <span className="text-xs text-neutral-600 select-none">ou</span>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>

            {/* Demo login */}
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={handleDemo}
              className="w-full border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-600 transition-colors font-medium"
            >
              Entrar como Thais (demo)
            </Button>

            <p className="text-center text-xs text-neutral-600 mt-4 leading-relaxed">
              Nenhuma senha necessária — seus dados ficam no seu dispositivo.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-10 text-center px-4">
        <p className="text-xs text-neutral-700 max-w-xs mx-auto leading-relaxed">
          Uma ferramenta para escritores que levam suas histórias a sério.
        </p>
      </footer>
    </div>
  )
}
