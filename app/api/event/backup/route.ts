import { NextResponse } from 'next/server'
import { isAdminAuthed } from '@/lib/auth'
import { readEvent } from '@/lib/event-store'
export const dynamic = 'force-dynamic'
export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const { courtSessions: _sessions, ...backup } = await readEvent()
  return new Response(JSON.stringify({ ...backup, courtSessions: {} }, null, 2), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Content-Disposition': 'attachment; filename="urc-2026-backup.json"' } })
}
