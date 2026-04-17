import { NextResponse } from 'next/server'

export function blockInProduction() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Esta operação só funciona no ambiente local de edição.' },
      { status: 503 },
    )
  }
  return null
}
