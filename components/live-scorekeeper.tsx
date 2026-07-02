'use client'

import { StatusPill } from '@/components/status-pill'
import { useLiveDemo } from '@/lib/use-live-demo'
import type { LiveDemoState } from '@/lib/live-demo'

export function LiveScorekeeper({ initialState }: { initialState: LiveDemoState }) {
  const { state, error, sendAction } = useLiveDemo(initialState)
  const liveState = state ?? initialState
  const match = liveState.matches.find((candidate) => !candidate.submitted) ?? liveState.matches[0]
  const submitted = match.submitted

  return (
    <div className="rounded-[2rem] bg-white p-4 text-ink shadow-panel">
      <div className="rounded-[1.5rem] bg-slate-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{match.court} · Badminton</p>
            <h1 className="mt-1 text-2xl font-black">
              {match.teamA} vs {match.teamB}
            </h1>
          </div>
          <StatusPill tone={submitted ? 'success' : 'warning'}>{submitted ? 'Submitted' : 'Locked to you'}</StatusPill>
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-bold text-amber-800">Live scorekeeper flow</p>
        <p className="mt-1 text-sm leading-6 text-amber-900">
          Tap the side that won the rally. When you submit final, this court advances to the next scheduled match. If no
          match is left for that court, the display keeps the final score.
        </p>
      </div>

      {error && <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{error}</p>}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { side: 'A' as const, team: match.teamA, score: match.teamAScore },
          { side: 'B' as const, team: match.teamB, score: match.teamBScore }
        ].map((team) => (
          <button
            key={team.side}
            disabled={submitted}
            onClick={() => sendAction({ action: 'awardPoint', matchId: match.id, side: team.side })}
            className="rounded-[1.5rem] bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <p className="text-sm font-semibold text-slate-500">{team.team}</p>
            <p className="mt-4 text-7xl font-black tracking-tight">{team.score}</p>
            <p className="mt-3 rounded-full bg-court-50 px-3 py-2 text-center text-sm font-bold text-court-700">Award point</p>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-ink p-5 text-white">
        <p className="text-sm text-slate-300">Current score string</p>
        <p className="mt-2 text-3xl font-black">{match.score}</p>
        <p className="mt-1 text-sm text-slate-300">Badminton rally scoring: every rally awards a point.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => sendAction({ action: 'reset' })}
          className="rounded-2xl border border-slate-300 px-4 py-4 font-bold text-slate-700"
        >
          Reset demo
        </button>
        <button
          disabled={submitted}
          onClick={() => sendAction({ action: 'submitMatch', matchId: match.id })}
          className="rounded-2xl bg-ink px-4 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit final and lock
        </button>
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-rose-50 p-4 ring-1 ring-rose-100">
        <p className="text-sm font-black text-rose-800">Submitted score rule</p>
        <p className="mt-1 text-sm leading-6 text-rose-900">
          After final submit, this phone can no longer edit the match. Corrections move to the admin correction workflow.
        </p>
      </div>
    </div>
  )
}
