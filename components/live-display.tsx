'use client'

import { useLiveScores } from '@/lib/use-live-scores'
import type { LiveState } from '@/lib/live-state'

function stateTone(state: string): string {
  const value = state.toLowerCase()
  if (value.includes('final') || value.includes('submitted')) return 'bg-emerald-500 text-slate-950'
  if (value.includes('live')) return 'bg-amber-400 text-slate-950'
  return 'bg-white/15 text-white'
}

export function LiveDisplay({ initialState, courts }: { initialState: LiveState; courts: number }) {
  const { state } = useLiveScores(initialState)
  const live = state ?? initialState

  if (live.courts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-10 py-16 text-center">
          <p className="text-3xl font-bold sm:text-4xl">No active courts</p>
          <p className="mt-3 text-base font-medium text-slate-400 sm:text-lg">
            Publish a schedule and assign matches to courts to fill this board.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid flex-1 gap-4 py-6 sm:grid-cols-2">
      {live.courts.slice(0, courts).map((court) => (
        <article key={court.court} className="flex flex-col rounded-2xl bg-white p-6 text-ink">
          <div className="flex items-center justify-between gap-4">
            <p className="text-3xl font-bold tracking-tight sm:text-4xl">{court.court}</p>
            <span className={`rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide ${stateTone(court.state)}`}>
              {court.state}
            </span>
          </div>
          <p className="mt-6 line-clamp-2 min-h-14 text-2xl font-bold leading-tight sm:text-3xl">{court.match}</p>
          <p className="tabular mt-auto rounded-xl bg-slate-950 px-6 py-4 text-center text-4xl font-bold text-white sm:text-5xl">
            {court.score}
          </p>
          <p className="mt-3 text-sm font-medium text-slate-400">Scorekeeper · {court.scorekeeper}</p>
        </article>
      ))}
    </div>
  )
}
