'use client'

import { useState } from 'react'
import { StatusPill } from '@/components/status-pill'
import { useLiveDemo } from '@/lib/use-live-demo'
import type { LiveDemoState } from '@/lib/live-demo'

type Match = {
  court: string
  division: string
  round: string
  teamA: string
  teamB: string
  score: string
  status: string
  editableBy: string
  time: string
}

type Standing = {
  rank: number
  team: string
  division: string
  played: number
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  differential: number
}

type ScheduleItem = {
  time: string
  court: string
  division: string
  match: string
  phase: string
  status: string
}

const tabs = ['Games', 'Standings', 'Schedule'] as const
type Tab = (typeof tabs)[number]

function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'Live' || status.includes('live')) return 'warning'
  if (status === 'Submitted' || status === 'Completed') return 'success'
  return 'neutral'
}

export function TournamentTabs({
  initialState
}: {
  initialState: LiveDemoState
}) {
  const [activeTab, setActiveTab] = useState<Tab>('Games')
  const { state, error } = useLiveDemo(initialState)
  const liveState = state ?? initialState
  const matches = liveState.matches satisfies Match[]
  const standings = liveState.standings satisfies Standing[]
  const schedule = liveState.schedule satisfies ScheduleItem[]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-2">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${
                activeTab === tab ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between px-2 text-xs font-bold text-slate-500">
          <span>Live refresh every 2s</span>
          <span>Version {liveState.version}</span>
        </div>
        {error && <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
      </div>

      {activeTab === 'Games' && (
        <div className="divide-y divide-slate-200">
          {matches.map((match) => (
            <article key={`${match.court}-${match.teamA}`} className="p-4 hover:bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-wide text-court-700">
                  {match.time} · {match.court} · {match.division} · {match.round}
                </p>
                <StatusPill tone={statusTone(match.status)}>{match.status}</StatusPill>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <p className="text-lg font-black text-ink">{match.teamA}</p>
                <p className="rounded-xl bg-slate-900 px-4 py-3 text-center text-2xl font-black text-white">{match.score}</p>
                <p className="text-lg font-black text-ink md:text-right">{match.teamB}</p>
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Edit state: {match.editableBy}</p>
            </article>
          ))}
        </div>
      )}

      {activeTab === 'Standings' && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Division</th>
                <th className="px-4 py-3 text-center">P</th>
                <th className="px-4 py-3 text-center">W</th>
                <th className="px-4 py-3 text-center">L</th>
                <th className="px-4 py-3 text-center">PF</th>
                <th className="px-4 py-3 text-center">PA</th>
                <th className="px-4 py-3 text-center">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {standings.map((standing) => (
                <tr key={standing.team} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-lg font-black text-ink">{standing.rank}</td>
                  <td className="px-4 py-4 font-black text-ink">{standing.team}</td>
                  <td className="px-4 py-4 font-semibold text-slate-600">{standing.division}</td>
                  <td className="px-4 py-4 text-center font-bold">{standing.played}</td>
                  <td className="px-4 py-4 text-center font-bold text-court-700">{standing.wins}</td>
                  <td className="px-4 py-4 text-center font-bold">{standing.losses}</td>
                  <td className="px-4 py-4 text-center font-bold">{standing.pointsFor}</td>
                  <td className="px-4 py-4 text-center font-bold">{standing.pointsAgainst}</td>
                  <td className="px-4 py-4 text-center font-bold">{standing.differential > 0 ? `+${standing.differential}` : standing.differential}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Schedule' && (
        <div className="divide-y divide-slate-200">
          {schedule.map((match) => (
            <div key={`${match.time}-${match.court}`} className="grid gap-3 p-4 hover:bg-slate-50 md:grid-cols-[90px_90px_1fr_auto] md:items-center">
              <p className="font-black text-ink">{match.time}</p>
              <p className="text-sm font-bold text-court-700">{match.court}</p>
              <div>
                <p className="font-black text-ink">{match.match}</p>
                <p className="text-sm text-slate-500">
                  {match.division} · {match.phase}
                </p>
              </div>
              <StatusPill tone={statusTone(match.status)}>{match.status}</StatusPill>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
