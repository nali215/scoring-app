import type { GameSnapshot } from './scoring/types'
import type { ServiceStart } from './doubles-service'

export const MAX_COURTS = 8
export type Division = 'men' | 'mixed' | 'legends' | 'adult' | 'junior'
export const divisionNames: Record<Division, string> = { men: "Men's Doubles", mixed: 'Mixed Doubles', legends: 'Legends 45+ Doubles', adult: 'Ages 17+ Doubles', junior: 'Ages 11–13 Doubles' }
export const divisions: Division[] = ['men', 'mixed', 'legends']
export type Team = { id: string; division: Division; name: string; players: string[]; checkedIn: boolean; displayPlayers?: string[] }
export type Slot = { team?: string; seed?: number; winner?: number }
export type Match = {
  number: number; division: Division; round: 'Round robin' | 'Round of 16' | 'Quarterfinal' | 'Semifinal' | 'Final'; court: number; time: string; date?: string; sideOutScoring?: boolean; format?: { pointsToWin: number; bestOf: 1 | 3 };
  a: Slot; b: Slot; games: GameSnapshot[]; status: 'Scheduled' | 'Live' | 'Awaiting confirmation' | 'Final';
  coinToss?: { winner: 'A' | 'B'; at: string };
  winner?: string; version: number; history: { games: GameSnapshot[]; status: Match['status'] }[];
  rallies: ('A' | 'B')[][];
  starts: ServiceStart[];
  log: { at: string; action: 'point' | 'removePoint' | 'startGame' | 'removeRally'; game: number; side?: 'A'|'B'; server: string; receiver: string; score: string; nextServer: string; serviceCourt: string }[];
}
export type EventState = {
  schema: 1; version: number; updatedAt: string; published: boolean;
  settings: { name: string; date: string; venue: string; timezone: string; note: string; winBy: number; cap: number; reviewed: boolean; sport?: 'badminton' | 'pickleball'; sideOutScoring?: boolean; endDate?: string; courtCount?: number };
  teams: Team[]; matches: Match[]; seeds: Partial<Record<Division, string[]>>;
  coinTosses?: { id: string; division: Division; teams: string[]; winner: string; note: string; at: string; actor: string }[];
  scorerAccounts?: Record<string, { username: string; passwordHash: string }>;
  courtSessions: Record<string, string>;
  scorerNames: Record<string, string>;
  scorerEnabled: Record<string, boolean>;
  audit: { at: string; actor: string; action: string; match?: number; detail: string }[];
  requests: string[];
}
export type EventView = Omit<EventState, 'courtSessions' | 'requests' | 'audit' | 'scorerAccounts'> & { audit?: EventState['audit']; activeCourts?: number[]; scorerUsernames?: Record<string, string> }

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
  return (team?.displayPlayers?.[index] ?? team?.players[index]??`Player ${index+1}`).replace(/\b[a-z]/g,c=>c.toUpperCase())
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

export function eventDivisions(state: Pick<EventState,'teams'>): Division[] { return [...new Set(state.teams.map(t=>t.division))] }
export function eventCourts(state: Pick<EventState,'settings'>) { return Array.from({length:state.settings.courtCount??3},(_,i)=>i+1) }
export function matchDate(state: Pick<EventState,'settings'>, match: Match) { return match.date??state.settings.date }
export function formatDate(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'}) }
export function formatDescription(match: Match) { const f=match.format??{pointsToWin:21,bestOf:match.round==='Round robin'?1:3};return `${f.bestOf===1?'1 game':'Best of 3'} to ${f.pointsToWin}` }
