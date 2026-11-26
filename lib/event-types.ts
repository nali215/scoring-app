import type { GameSnapshot } from './scoring/types'
import type { ServiceStart } from './doubles-service'

export type Division = 'men' | 'mixed' | 'legends'
export const divisionNames: Record<Division, string> = { men: "Men's Doubles", mixed: 'Mixed Doubles', legends: 'Legends 45+ Doubles' }
export const divisions: Division[] = ['men', 'mixed', 'legends']
export type Team = { id: string; division: Division; name: string; players: string[]; checkedIn: boolean }
export type Slot = { team?: string; seed?: number; winner?: number }
export type Match = {
  number: number; division: Division; round: 'Round robin' | 'Quarterfinal' | 'Semifinal' | 'Final'; court: number; time: string;
  a: Slot; b: Slot; games: GameSnapshot[]; status: 'Scheduled' | 'Live' | 'Awaiting confirmation' | 'Final';
  winner?: string; version: number; history: { games: GameSnapshot[]; status: Match['status'] }[];
  rallies: ('A' | 'B')[][];
  starts: ServiceStart[];
  log: { at: string; action: 'point' | 'removePoint' | 'startGame'; game: number; side?: 'A'|'B'; server: string; receiver: string; score: string; nextServer: string; serviceCourt: string }[];
}
export type EventState = {
  schema: 1; version: number; updatedAt: string; published: boolean;
  settings: { name: string; date: string; venue: string; timezone: string; note: string; winBy: number; cap: number; reviewed: boolean };
  teams: Team[]; matches: Match[]; seeds: Partial<Record<Division, string[]>>;
  coinTosses?: { id: string; division: Division; teams: string[]; winner: string; note: string; at: string; actor: string }[];
  courtSessions: Record<string, string>;
  scorerNames: Record<string, string>;
  scorerEnabled: Record<string, boolean>;
  audit: { at: string; actor: string; action: string; match?: number; detail: string }[];
  requests: string[];
}
export type EventView = Omit<EventState, 'courtSessions' | 'requests' | 'audit'> & { audit?: EventState['audit']; activeCourts?: number[] }

export function teamName(state: Pick<EventState, 'teams'>, slot: Slot): string {
  return state.teams.find(t => t.id === slot.team)?.name ?? (slot.seed ? `Seed #${slot.seed}` : slot.winner ? `Winner #${slot.winner}` : 'To be assigned')
}
export function formatTime(time: string) {
  if (time === 'TBA') return 'TBA'
  const [h, m] = time.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
export function matchScore(m: Match) {
  return m.games.length ? m.games.map(g => `${g.teamAScore}–${g.teamBScore}`).join(' / ') : '—'
}
export function playerName(state: Pick<EventState,'teams'>, match: Match, side:'A'|'B', index:number) {
  const team=state.teams.find(t=>t.id===(side==='A'?match.a.team:match.b.team))
  return (team?.players[index]??`Player ${index+1}`).replace(/\b[a-z]/g,c=>c.toUpperCase())
}

export function standings(state: Pick<EventState, 'teams' | 'matches'>, division: Division) {
  const rows = state.teams.filter(t => t.division === division).map(t => ({ team: t, played: 0, wins: 0, losses: 0, for: 0, against: 0, diff: 0 }))
  for (const m of state.matches.filter(m => m.division === division && m.round === 'Round robin' && m.status === 'Final')) {
    for (const [slot, side] of [[m.a, 'A'], [m.b, 'B']] as const) {
      const row = rows.find(r => r.team.id === slot.team)
      if (!row) continue
      row.played++
      if (m.winner === row.team.id) row.wins++; else row.losses++
      for (const g of m.games) { row.for += side === 'A' ? g.teamAScore : g.teamBScore; row.against += side === 'A' ? g.teamBScore : g.teamAScore }
      row.diff = row.for - row.against
    }
  }
  return rows.sort((a, b) => b.wins - a.wins || b.diff - a.diff || b.for - a.for || a.team.name.localeCompare(b.team.name))
}
