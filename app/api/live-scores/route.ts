import { NextResponse } from 'next/server'
import { applyLiveAction, getLiveState } from '@/lib/live-state'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(getLiveState())
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return NextResponse.json(applyLiveAction(body))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update live score' },
      { status: 400 }
    )
  }
}

