import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import { LiveScorekeeper } from '@/components/live-scorekeeper'
import { StatusPill } from '@/components/status-pill'
import { getLiveState } from '@/lib/live-state'

export default async function CourtScorekeeperPage({
  params,
  searchParams
}: {
  params: Promise<{ courtId: string }>
  searchParams: Promise<{ code?: string | string[] }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const initialState = getLiveState()
  const code = Array.isArray(resolvedSearchParams.code) ? resolvedSearchParams.code[0] : resolvedSearchParams.code
  const hasCode = Boolean(code)
  const courtLabel = `Court ${resolvedParams.courtId}`

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppHeader theme="dark" />
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <div className="mb-6 border border-white/10 bg-white/5 p-5 text-white">
          <StatusPill tone={hasCode ? 'success' : 'danger'}>{hasCode ? 'Access link' : 'Missing code'}</StatusPill>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">{courtLabel} scorekeeper</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            This page is scoped to one court. The current match for this court appears here after the admin publishes the
            schedule.
          </p>
        </div>

        {!hasCode ? (
          <div className="border border-rose-900/50 bg-rose-950/40 p-8 text-center">
            <p className="text-2xl font-black">Invalid scorekeeper link</p>
            <p className="mt-2 text-sm text-rose-100">Ask the tournament admin to send you the current court link.</p>
            <Link href="/" className="mt-6 inline-flex bg-white px-5 py-3 text-sm font-bold text-slate-950">
              Back to tournaments
            </Link>
          </div>
        ) : (
          <LiveScorekeeper initialState={initialState} />
        )}
      </section>
    </main>
  )
}
