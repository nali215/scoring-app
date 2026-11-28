import { NextResponse } from 'next/server'
import { isSameOrigin } from '@/lib/request-origin'
import { isAdminAuthed, getScorerAuth } from '@/lib/auth'
import { readEvent, mutateEvent } from '@/lib/event-store'
import { eventCourts } from '@/lib/event-types'
import { actionSchema, applyEventAction, EventError, publicView, type Actor } from '@/lib/event-engine'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const response = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
export async function GET(request: Request) {
  try {
    const admin = await isAdminAuthed(), state = await readEvent(true)
    const court = new URL(request.url).searchParams.get('court') ?? '', scorer=await getScorerAuth()
    const courtAccess = Boolean(scorer && eventCourts(state).includes(scorer.court) && String(scorer.court)===court && state.scorerEnabled[court] && state.courtSessions[court]===scorer.session)
    if (court && !courtAccess && !admin) return response({ error: 'Scoring session ended or this court is not assigned to you. Sign in again.' }, 403)
    if (!state.published && !admin && !courtAccess) return response({ unpublished: true })
    return response(publicView(state, admin))
  } catch { return response({ error: 'Tournament storage is unavailable. Contact the organizer.' }, 503) }
}
export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return response({ error: 'Cross-site request rejected.' }, 403)
    if (!request.headers.get('content-type')?.includes('application/json')) return response({ error: 'JSON request required.' }, 415)
    const raw = await request.text()
    if (raw.length > 16000) return response({ error: 'Request too large.' }, 413)
    const parsed = actionSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return response({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, 400)
    const admin = await isAdminAuthed()
    const scorer=await getScorerAuth()
    if(!admin&&!scorer)return response({error:'Sign in as the assigned scorer or organizer.'},403)
    const actor: Actor = admin ? { admin: true } : { admin: false, court: scorer!.court, session: scorer!.session }
    const state = await mutateEvent(current => applyEventAction(current, parsed.data, actor))
    return response(publicView(state, admin))
  } catch (error) {
    if (error instanceof EventError) return response({ error: error.message }, error.status)
    if (error instanceof SyntaxError) return response({ error: 'Invalid JSON.' }, 400)
    return response({ error: 'Update could not be saved. Refresh before trying again.' }, 503)
  }
}
