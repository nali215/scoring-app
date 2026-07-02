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
      <section className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <StatusPill tone={hasCode ? 'success' : 'danger'} dot={hasCode}>
            {hasCode ? 'Access link active' : 'Missing code'}
          </StatusPill>
          <h1 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">{courtLabel} scorekeeper</h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-400">
            This page is scoped to one court. Its current match shows here once the schedule is published.
          </p>
        </div>

        {!hasCode ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
            <p className="text-lg font-bold">Invalid scorekeeper link</p>
            <p className="mt-1.5 text-sm text-rose-100/80">Ask the tournament admin to send you the current court link.</p>
            <Link href="/" className="mt-6 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950">
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
