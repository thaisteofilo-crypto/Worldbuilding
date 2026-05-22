import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
  }

  // 1. Cria o usuário sem exigir confirmação de email
  const adminSupabase = createAdminClient()
  const { error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: name ?? '' },
  })

  if (createError) {
    const msg =
      createError.message.toLowerCase().includes('already registered') ||
      createError.message.toLowerCase().includes('already been registered')
        ? 'Este email já está cadastrado.'
        : createError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // 2. Faz login automático e escreve os cookies de sessão na resposta
  const response = NextResponse.json({ ok: true })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    // Usuário criado mas sessão falhou — redireciona para login manual
    return NextResponse.json({ ok: true, warning: 'created_no_session' })
  }

  return response
}
