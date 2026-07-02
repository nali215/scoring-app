import { LiveDisplay } from '@/components/live-display'
import { getLiveState } from '@/lib/live-state'

export default function DisplayPage() {
  const initialState = getLiveState()

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 11.5 6 3l4 8.5M4 8.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="5" r="1.6" fill="currentColor" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">Live Scoreboard</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Courts</h1>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-slate-950 sm:text-base">
            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-950" />
            Live
          </span>
        </div>

        <LiveDisplay initialState={initialState} courts={8} />
      </section>
    </main>
  )
}
