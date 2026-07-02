'use client'

import { useLiveScores } from '@/lib/use-live-scores'
import type { LiveState } from '@/lib/live-state'

export function LiveDisplay({ initialState, courts }: { initialState: LiveState; courts: number }) {
  const { state } = useLiveScores(initialState)
  const liveState = state ?? initialState

  return (
    <div className="grid flex-1 gap-5 py-6 lg:grid-cols-2">
      {liveState.courts.length === 0 && (
        <div className="col-span-full flex min-h-[50vh] items-center justify-center rounded-xl border border-white/10 bg-white/5 p-10 text-center">
          <div>
            <p className="text-4xl font-black">No active courts</p>
            <p className="mt-3 text-lg font-semibold text-slate-300">Publish a schedule and assign matches to courts to populate this display.</p>
          </div>
        </div>
      )}
      {liveState.courts.slice(0, courts).map((court) => (
        <article key={court.court} className="rounded-[2rem] bg-white p-6 text-ink">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-5xl font-black">{court.court}</p>
              <p className="mt-2 text-lg font-semibold text-slate-500">Scorekeeper: {court.scorekeeper}</p>
            </div>
            <p className="rounded-full bg-ink px-5 py-3 text-2xl font-black text-white">{court.state}</p>
          </div>
          <p className="mt-8 min-h-20 text-4xl font-black leading-tight">{court.match}</p>
          <p className="mt-6 rounded-[1.5rem] bg-court-500 px-6 py-5 text-center text-5xl font-black text-black">{court.score}</p>
        </article>
      ))}
    </div>
  )
}
