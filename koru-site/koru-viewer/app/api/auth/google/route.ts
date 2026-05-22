import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  const { origin } = new URL(req.url)
  const next = req.nextUrl.searchParams.get('next') ?? '/'

  // Response temporária — apenas para capturar cookies do PKCE se necessário
  const response = new NextResponse()

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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(new URL('/entrar?error=oauth', req.url))
  }

  // Redireciona para a URL do Google, preservando cookies PKCE
  const redirect = NextResponse.redirect(data.url)
  response.cookies.getAll().forEach(({ name, value, ...opts }) => {
    redirect.cookies.set(name, value, opts)
  })
  return redirect
}
