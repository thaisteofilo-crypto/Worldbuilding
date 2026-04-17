import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json()
  const correct = process.env.SITE_PASSWORD
  const token = process.env.SITE_TOKEN

  if (!correct || !token) {
    return NextResponse.json(
      { error: 'Configuração do servidor incompleta' },
      { status: 500 },
    )
  }

  if (password !== correct) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('koru-site-access', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return response
}
