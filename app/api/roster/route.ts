import { NextResponse } from 'next/server'
import type { DraftTeam } from '@/lib/roster'
import { deleteTeam, getRoster, importRoster, resetRoster, updatePlayer, updateTeam } from '@/lib/roster-store'

export const dynamic = 'force-dynamic'

type RosterRequest =
  | { action: 'import'; drafts: DraftTeam[] }
  | { action: 'updateTeam'; teamId: string; patch: { name?: string; division?: string; seed?: number | null } }
  | {
      action: 'updatePlayer'
      teamId: string
      playerId: string
      patch: { firstName?: string; lastName?: string; email?: string | null; phone?: string | null }
    }
  | { action: 'deleteTeam'; teamId: string }
  | { action: 'reset' }

export async function GET() {
  return NextResponse.json(getRoster())
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RosterRequest

    switch (body.action) {
      case 'import': {
        const { roster, results } = importRoster(body.drafts)
        return NextResponse.json({ roster, results })
      }
      case 'updateTeam':
        return NextResponse.json({ roster: updateTeam(body.teamId, body.patch) })
      case 'updatePlayer':
        return NextResponse.json({ roster: updatePlayer(body.teamId, body.playerId, body.patch) })
      case 'deleteTeam':
        return NextResponse.json({ roster: deleteTeam(body.teamId) })
      case 'reset':
        return NextResponse.json({ roster: resetRoster() })
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update roster' },
      { status: 400 }
    )
  }
}
