import { NextResponse } from 'next/server'
export function GET() { return NextResponse.json({ error: 'Use the event API.' }, { status: 410 }) }
export const POST = GET
