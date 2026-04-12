import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname.startsWith('/admin/login')

  if (isAdminRoute && !isLoginPage) {
    const adminCookie = request.cookies.get('koru-admin')
    if (adminCookie?.value !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
