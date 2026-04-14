import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('koru-admin')?.value
  const expected = process.env.ADMIN_TOKEN

  if (!expected || !token || token !== expected) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/((?!login).*)'],
}
