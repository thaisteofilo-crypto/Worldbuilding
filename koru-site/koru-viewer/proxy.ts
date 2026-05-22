import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Cria um response mutável para o Supabase atualizar os cookies de sessão
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Propaga para o request (evita erro de leitura seguinte)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Recria o response com os cookies atualizados
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Valida sessão do usuário (refresca token se necessário)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const gateUrl = new URL('/entrar', request.url)
    if (pathname !== '/') gateUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(gateUrl)
  }

  // Proteção extra do admin: exige token estático além da sessão
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('koru-admin')?.value
    const adminExpected = process.env.ADMIN_TOKEN
    if (!adminExpected || adminToken !== adminExpected) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!entrar|auth/callback|api/auth/|api/banners|api/debug|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|mp4|webm|mp3|ogg|wav|ico|woff|woff2|ttf|otf)$).*)',
  ],
}
