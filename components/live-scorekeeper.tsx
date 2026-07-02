'use client'

import { RotateCcw } from 'lucide-react'
import { StatusPill } from '@/components/status-pill'
import { Button } from '@/components/ui'
import { useLiveScores } from '@/lib/use-live-scores'
import type { LiveState } from '@/lib/live-state'

export function LiveScorekeeper({ initialState }: { initialState: LiveState }) {
  const { state, error, sendAction } = useLiveScores(initialState)
  const live = state ?? initialState
  const match = live.matches.find((candidate) => !candidate.submitted) ?? live.matches[0]

  if (!match) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-10 text-center">
        <p className="text-lg font-bold text-white">No match assigned</p>
        <p className="mt-1.5 text-sm text-slate-400">Your assigned live match will appear here once the schedule is published.</p>
      </div>
    )
  }

  const submitted = match.submitted

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white text-ink shadow-pop">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-slate-50 px-5 py-3.5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{match.court} · {match.division}</p>
          <h2 className="mt-0.5 text-base font-bold text-ink">
            {match.teamA} <span className="text-slate-400">vs</span> {match.teamB}
          </h2>
        </div>
        <StatusPill tone={submitted ? 'success' : 'warning'} dot={!submitted}>
          {submitted ? 'Final' : 'Live'}
        </StatusPill>
      </div>

      {error ? <p className="border-b border-rose-100 bg-rose-50 px-5 py-2 text-xs font-semibold text-rose-700">{error}</p> : null}

      <div className="grid grid-cols-2 gap-px bg-line">
        {[
          { side: 'A' as const, team: match.teamA, score: match.teamAScore },
          { side: 'B' as const, team: match.teamB, score: match.teamBScore }
        ].map((team) => (
          <button
            key={team.side}
            disabled={submitted}
            onClick={() => sendAction({ action: 'awardPoint', matchId: match.id, side: team.side })}
            className="group flex flex-col items-center bg-white px-4 py-8 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
          >
            <span className="line-clamp-1 text-sm font-semibold text-slate-500">{team.team}</span>
            <span className="tabular mt-2 text-7xl font-bold tracking-tight text-ink">{team.score}</span>
            {!submitted ? (
              <span className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white group-hover:bg-brand-700">
                +1 Point
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="border-t border-line px-5 py-3 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Current score</p>
        <p className="tabular mt-0.5 text-lg font-bold text-ink">{match.score}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-line p-4">
        <Button variant="secondary" onClick={() => sendAction({ action: 'reset' })}>
          <RotateCcw size={15} />
          Reset
        </Button>
        <Button variant="primary" disabled={submitted} onClick={() => sendAction({ action: 'submitMatch', matchId: match.id })}>
          Submit final
        </Button>
      </div>

      <p className="border-t border-line bg-slate-50 px-5 py-3 text-xs leading-5 text-slate-500">
        After you submit, this match locks and the court advances to the next scheduled match. Corrections then require
        admin approval.
      </p>
    </div>
  )
}
