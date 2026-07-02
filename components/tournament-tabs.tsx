'use client'

import { useState } from 'react'
import { CalendarClock, ListOrdered, Radio } from 'lucide-react'
import { StatusPill } from '@/components/status-pill'
import { cn } from '@/components/ui'
import { useLiveScores } from '@/lib/use-live-scores'
import type { LiveState } from '@/lib/live-state'

const tabs = [
  { key: 'Games', icon: Radio },
  { key: 'Standings', icon: ListOrdered },
  { key: 'Schedule', icon: CalendarClock }
] as const
type Tab = (typeof tabs)[number]['key']

function statusTone(status: string): 'neutral' | 'success' | 'warning' {
  const value = status.toLowerCase()
  if (value.includes('live')) return 'warning'
  if (value.includes('final') || value.includes('submitted') || value.includes('complete')) return 'success'
  return 'neutral'
}

function EmptyRow({ title, note }: { title: string; note: string }) {
  return (
    <div className="p-10 text-center">
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </div>
  )
}

export function TournamentTabs({ initialState }: { initialState: LiveState }) {
  const [activeTab, setActiveTab] = useState<Tab>('Games')
  const { state, error } = useLiveScores(initialState)
  const live = state ?? initialState

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
                  isActive ? 'bg-ink text-white' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <Icon size={15} />
                {tab.key}
              </button>
            )
          })}
        </div>
        <span className="hidden items-center gap-1.5 pr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
          Auto-refresh
        </span>
      </div>

      {error ? <p className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700">{error}</p> : null}

      {activeTab === 'Games' &&
        (live.matches.length === 0 ? (
          <EmptyRow title="No games yet" note="Games appear here after the admin publishes a schedule." />
        ) : (
          <div className="divide-y divide-line">
            {live.matches.map((match) => (
              <article key={`${match.court}-${match.teamA}`} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    {match.time} · {match.court} · {match.division}
                  </p>
                  <StatusPill tone={statusTone(match.status)} dot={statusTone(match.status) === 'warning'}>
                    {match.status}
                  </StatusPill>
                </div>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <p className="text-[15px] font-bold text-ink">{match.teamA}</p>
                  <p className="tabular rounded-lg bg-slate-900 px-4 py-2 text-center text-xl font-bold text-white">{match.score}</p>
                  <p className="text-right text-[15px] font-bold text-ink">{match.teamB}</p>
                </div>
              </article>
            ))}
          </div>
        ))}

      {activeTab === 'Standings' &&
        (live.standings.length === 0 ? (
          <EmptyRow title="No standings yet" note="Standings update as completed matches are submitted." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">#</th>
                  <th className="px-4 py-2.5 font-semibold">Team</th>
                  <th className="px-4 py-2.5 font-semibold">Division</th>
                  <th className="px-3 py-2.5 text-center font-semibold">W</th>
                  <th className="px-3 py-2.5 text-center font-semibold">L</th>
                  <th className="px-3 py-2.5 text-center font-semibold">PF</th>
                  <th className="px-3 py-2.5 text-center font-semibold">PA</th>
                  <th className="px-3 py-2.5 text-center font-semibold">Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular">
                {live.standings.map((standing) => (
                  <tr key={standing.team} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-ink">{standing.rank}</td>
                    <td className="px-4 py-3 font-bold text-ink">{standing.team}</td>
                    <td className="px-4 py-3 text-slate-500">{standing.division}</td>
                    <td className="px-3 py-3 text-center font-semibold text-brand-700">{standing.wins}</td>
                    <td className="px-3 py-3 text-center font-semibold text-slate-600">{standing.losses}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{standing.pointsFor}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{standing.pointsAgainst}</td>
                    <td className="px-3 py-3 text-center font-semibold text-ink">
                      {standing.differential > 0 ? `+${standing.differential}` : standing.differential}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {activeTab === 'Schedule' &&
        (live.schedule.length === 0 ? (
          <EmptyRow title="No schedule published" note="Schedule rows appear after the admin assigns courts and times." />
        ) : (
          <div className="divide-y divide-line">
            {live.schedule.map((match) => (
              <div key={`${match.time}-${match.court}`} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 p-4">
                <p className="tabular text-sm font-bold text-ink">{match.time}</p>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{match.match}</p>
                  <p className="truncate text-xs text-slate-500">
                    {match.court} · {match.division} · {match.phase}
                  </p>
                </div>
                <StatusPill tone={statusTone(match.status)}>{match.status}</StatusPill>
              </div>
            ))}
          </div>
        ))}
    </div>
  )
}
