import { NextResponse } from 'next/server'
import { applyLiveDemoAction, getLiveDemoState } from '@/lib/live-demo'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(getLiveDemoState())
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const state = applyLiveDemoAction(body)
    return NextResponse.json(state)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update live score' },
      { status: 400 }
    )
  }
}

