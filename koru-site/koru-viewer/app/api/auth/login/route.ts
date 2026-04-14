import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json()
  const correct = process.env.ADMIN_PASSWORD
  const token = process.env.ADMIN_TOKEN

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
  response.cookies.set('koru-admin', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 86400,
  })

  return response
}
