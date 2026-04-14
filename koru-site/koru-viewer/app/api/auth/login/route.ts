import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { password } = await req.json()
  const correct = process.env.ADMIN_PASSWORD ?? 'koru2026'
  const token = process.env.ADMIN_TOKEN ?? 'koru-token-2026'

  if (password !== correct) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('koru-admin', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 86400,
  })

  return NextResponse.json({ ok: true })
}
