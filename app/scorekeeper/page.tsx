import { AppHeader } from '@/components/app-header'
import { LiveScorekeeper } from '@/components/live-scorekeeper'
import { StatusPill } from '@/components/status-pill'
import { getLiveState } from '@/lib/live-state'

export default function ScorekeeperPage() {
  const initialState = getLiveState()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppHeader theme="dark" />
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <div className="mb-6 border border-white/10 bg-white/5 p-5 text-white">
          <StatusPill tone="warning">Scorekeeper</StatusPill>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">Assigned match scoring</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Assigned matches appear here after the admin publishes the schedule and assigns scorekeepers.
          </p>
        </div>

        <LiveScorekeeper initialState={initialState} />
      </section>
    </main>
  )
}

