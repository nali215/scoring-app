import { NextResponse } from 'next/server'
import { isSameOrigin } from '@/lib/request-origin'
import { ADMIN_COOKIE, SCORER_COOKIE, expectedToken, verifyPassword, usingDefaultPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (usingDefaultPassword()) return NextResponse.json({ error: 'Organizer access is not configured.' }, { status: 503 })
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Cross-site request rejected.' }, { status: 403 })
  let password = ''
  try {
    const body = await request.json()
    password = String(body.password ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!verifyPassword(password)) {
    await new Promise(resolve => setTimeout(resolve, 800))
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.delete(SCORER_COOKIE)
  response.cookies.set(ADMIN_COOKIE, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12
  })
  return response
}
