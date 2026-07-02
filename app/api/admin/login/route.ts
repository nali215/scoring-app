import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, expectedToken, verifyPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let password = ''
  try {
    const body = await request.json()
    password = String(body.password ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12
  })
  return response
}
