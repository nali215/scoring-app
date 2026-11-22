import source from '@/data/urc-2026.json'
import type { Division, EventState, Slot, Team } from './event-types'

// MASTER SCHEDULE is authoritative. Numbers in parentheses are source team IDs, not playoff seeds.
export function createEvent(): EventState {
  const teams: Team[] = []
  const resolve = (text: string, division: Division): Slot => {
    const found = text.trim().match(/^(.+?)\((\d+)\)$/)
    if (!found) throw new Error(`Unrecognized source pairing: ${text}`)
    const id = `${division}-${found[2]}`
    if (!teams.some(t => t.id === id)) teams.push({ id, division, name: found[1].trim(), players: found[1].trim().split('/').map(p => p.trim().toLowerCase()), checkedIn: false })
    return { team: id }
  }
  const winners: Record<number, [number, number]> = { 46: [37, 38], 47: [39, 40], 49: [41, 42], 50: [43, 44], 51: [45, 48], 52: [46, 47], 53: [49, 50] }
  const matches = source.map(row => {
    const division: Division = row.category.startsWith("Men's") ? 'men' : row.category.startsWith('Mixed') ? 'mixed' : 'legends'
    let a: Slot, b: Slot
    if (row.number <= 36) {
      const pair = row.pairing.split(/\s*v(?:s)?\s*/)
      a = resolve(pair[0], division); b = resolve(pair[1], division)
    } else if (winners[row.number]) {
      a = { winner: winners[row.number][0] }; b = { winner: winners[row.number][1] }
    } else {
      const seeds = [...row.pairing.matchAll(/#(\d+)/g)].map(m => Number(m[1]))
      a = { seed: seeds[0] }; b = { seed: seeds[1] }
    }
    return { number: row.number, division, round: (row.number <= 36 ? 'Round robin' : row.number <= 44 ? 'Quarterfinal' : row.number <= 50 ? 'Semifinal' : 'Final') as EventState['matches'][number]['round'], court: row.court, time: row.time, a, b, games: [], rallies: [], starts: [], log: [], status: 'Scheduled' as const, version: 0, history: [] }
  })
  return {
    schema: 1, version: 1, updatedAt: new Date().toISOString(), published: false,
    settings: { name: 'URC Southwest Badminton Tournament', date: '2026-11-26', venue: '', timezone: 'America/Chicago', note: 'Breakfast 8:00–8:45 AM. First serve 8:45 AM. Lunch and ranking finalization after round robin. Knockout times TBA.', winBy: 2, cap: 30, reviewed: false },
    teams, matches, seeds: {}, courtSessions: {}, scorerNames: { '1': 'Court 1 scorer', '2': 'Court 2 scorer', '3': 'Court 3 scorer' }, scorerEnabled: { '1': true, '2': true, '3': true }, audit: [], requests: []
  }
}
