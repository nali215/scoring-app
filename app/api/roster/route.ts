import { NextResponse } from 'next/server'
export function GET() { return NextResponse.json({ error: 'Roster management has moved to the tournament dashboard.' }, { status: 410 }) }
export const POST = GET
