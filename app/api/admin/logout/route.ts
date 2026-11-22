import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, SCORER_COOKIE, getScorerAuth } from '@/lib/auth'
import { mutateEvent } from '@/lib/event-store'
import { isSameOrigin } from '@/lib/request-origin'

export const dynamic = 'force-dynamic'

export async function POST(request:Request) {
  if(!isSameOrigin(request))return NextResponse.json({error:'Cross-site request rejected.'},{status:403})
  const scorer=await getScorerAuth()
  if(scorer)await mutateEvent(s=>{if(s.courtSessions[String(scorer.court)]===scorer.session){delete s.courtSessions[String(scorer.court)];s.version++}return s})
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(SCORER_COOKIE)
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
  return response
}
