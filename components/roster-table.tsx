'use client'

import { Trash2 } from 'lucide-react'
import { StatusPill } from '@/components/status-pill'
import type { Roster } from '@/lib/roster'

type RosterTableProps = {
  roster: Roster
  onUpdateTeam: (teamId: string, patch: { name?: string; division?: string; seed?: number | null }) => void
  onUpdatePlayer: (
    teamId: string,
    playerId: string,
    patch: { firstName?: string; lastName?: string; email?: string | null; phone?: string | null }
  ) => void
  onDeleteTeam: (teamId: string) => void
}

const inputClass =
  'w-full border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-950 focus:border-slate-950 focus:outline-none'

export function RosterTable({ roster, onUpdateTeam, onUpdatePlayer, onDeleteTeam }: RosterTableProps) {
  if (roster.teams.length === 0) {
    return (
      <div className="border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="font-black text-slate-950">No teams yet</p>
        <p className="mt-1 text-sm text-slate-500">Import a roster file above to add teams and players.</p>
      </div>
    )
  }

  const sorted = [...roster.teams].sort(
    (a, b) => a.division.localeCompare(b.division) || (a.seed ?? 999) - (b.seed ?? 999) || a.name.localeCompare(b.name)
  )

  return (
    <div className="space-y-3">
      {sorted.map((team) => (
        <div key={`${team.id}-${roster.version}`} className="border border-slate-200 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_90px_auto] md:items-end">
            <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              Team name
              <input
                defaultValue={team.name}
                onBlur={(event) => {
                  const value = event.target.value.trim()
                  if (value && value !== team.name) onUpdateTeam(team.id, { name: value })
                }}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              Division
              <input
                defaultValue={team.division}
                onBlur={(event) => {
                  const value = event.target.value.trim()
                  if (value && value !== team.division) onUpdateTeam(team.id, { division: value })
                }}
                className={inputClass}
              />
            </label>
            <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              Seed
              <input
                type="number"
                defaultValue={team.seed ?? ''}
                onBlur={(event) => {
                  const raw = event.target.value.trim()
                  const value = raw === '' ? null : Number.parseInt(raw, 10)
                  onUpdateTeam(team.id, { seed: value })
                }}
                className={inputClass}
              />
            </label>
            <button
              onClick={() => onDeleteTeam(team.id)}
              aria-label={`Remove ${team.name}`}
              className="inline-flex h-9 items-center justify-center gap-1 border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-700"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>

          <div className="mt-3 grid gap-2">
            {team.players.map((player) => (
              <div key={`${player.id}-${roster.version}`} className="grid gap-2 border-t border-slate-100 pt-2 md:grid-cols-4">
                <input
                  defaultValue={player.firstName}
                  aria-label="First name"
                  onBlur={(event) => {
                    const value = event.target.value.trim()
                    if (value && value !== player.firstName) onUpdatePlayer(team.id, player.id, { firstName: value })
                  }}
                  className={inputClass}
                  placeholder="First name"
                />
                <input
                  defaultValue={player.lastName}
                  aria-label="Last name"
                  onBlur={(event) => {
                    const value = event.target.value.trim()
                    if (value !== player.lastName) onUpdatePlayer(team.id, player.id, { lastName: value })
                  }}
                  className={inputClass}
                  placeholder="Last name"
                />
                <input
                  defaultValue={player.email ?? ''}
                  aria-label="Email"
                  onBlur={(event) => {
                    const value = event.target.value.trim()
                    if (value !== (player.email ?? '')) onUpdatePlayer(team.id, player.id, { email: value || null })
                  }}
                  className={inputClass}
                  placeholder="Email"
                />
                <input
                  defaultValue={player.phone ?? ''}
                  aria-label="Phone"
                  onBlur={(event) => {
                    const value = event.target.value.trim()
                    if (value !== (player.phone ?? '')) onUpdatePlayer(team.id, player.id, { phone: value || null })
                  }}
                  className={inputClass}
                  placeholder="Phone"
                />
              </div>
            ))}
          </div>

          <div className="mt-3">
            <StatusPill>{team.players.length === 1 ? 'Singles' : `${team.players.length} players`}</StatusPill>
          </div>
        </div>
      ))}
    </div>
  )
}
