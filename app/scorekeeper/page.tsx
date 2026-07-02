import { AppHeader } from '@/components/app-header'
import { LiveScorekeeper } from '@/components/live-scorekeeper'
import { StatusPill } from '@/components/status-pill'
import { getLiveState } from '@/lib/live-state'

export default function ScorekeeperPage() {
  const initialState = getLiveState()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppHeader theme="dark" />
      <section className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <StatusPill tone="warning">Scorekeeper</StatusPill>
          <h1 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">Assigned match scoring</h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-400">
            Your assigned match appears here once the admin publishes the schedule. Use the court link you were sent to
            score a specific court.
          </p>
        </div>

        <LiveScorekeeper initialState={initialState} />
      </section>
    </main>
  )
}
