'use client'

import { useLiveDemo } from '@/lib/use-live-demo'
import type { LiveDemoState } from '@/lib/live-demo'

export function LiveDisplay({ initialState, courts }: { initialState: LiveDemoState; courts: number }) {
  const { state } = useLiveDemo(initialState)
  const liveState = state ?? initialState

  return (
    <div className="grid flex-1 gap-5 py-6 lg:grid-cols-2">
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

