import { NextRequest, NextResponse } from 'next/server'

// Gera nonce edge-safe (sem Buffer): converte bytes aleatórios em base64.
function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function buildCsp(_nonce: string): string {
  // script-src mantém 'unsafe-inline' porque Next 16 + Turbopack não propagam
  // nonce automaticamente para chunks RSC, e 'strict-dynamic' bloqueia tudo.
  // 'unsafe-eval' continua removido — esse era o ganho principal do Sprint 5.
  // style-src mantém 'unsafe-inline' porque Tailwind/Next injetam estilos inline.
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.anthropic.com https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

function applySecurityHeaders(response: NextResponse, nonce: string, csp: string) {
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('x-nonce', nonce)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const nonce = generateNonce()
  const csp = buildCsp(nonce)

  // Propaga nonce para o RSC via request headers (server components podem ler com headers()).
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const siteToken = request.cookies.get('koru-site-access')?.value
  const siteExpected = process.env.SITE_TOKEN

  if (!siteExpected || siteToken !== siteExpected) {
    const gateUrl = new URL('/entrar', request.url)
    if (pathname !== '/') gateUrl.searchParams.set('next', pathname)
    const redirectResponse = NextResponse.redirect(gateUrl)
    applySecurityHeaders(redirectResponse, nonce, csp)
    return redirectResponse
  }

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('koru-admin')?.value
    const adminExpected = process.env.ADMIN_TOKEN
    if (!adminExpected || adminToken !== adminExpected) {
      const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url))
      applySecurityHeaders(redirectResponse, nonce, csp)
      return redirectResponse
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  applySecurityHeaders(response, nonce, csp)
  return response
}

export const config = {
  matcher: [
    '/((?!entrar|api/auth/site-login|api/banners|api/debug|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|mp4|webm|mp3|ogg|wav|ico|woff|woff2|ttf|otf)$).*)',
  ],
}
