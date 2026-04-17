import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const siteToken = request.cookies.get('koru-site-access')?.value
  const siteExpected = process.env.SITE_TOKEN

  if (!siteExpected || siteToken !== siteExpected) {
    const gateUrl = new URL('/entrar', request.url)
    if (pathname !== '/') gateUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(gateUrl)
  }

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('koru-admin')?.value
    const adminExpected = process.env.ADMIN_TOKEN
    if (!adminExpected || adminToken !== adminExpected) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!entrar|api/auth/site-login|api/banners|api/debug|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|mp4|webm|mp3|ogg|wav|ico|woff|woff2|ttf|otf)$).*)',
  ],
}
