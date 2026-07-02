import { randomUUID } from 'node:crypto'
import {
  createEmptyRoster,
  mergeRoster,
  type DraftTeam,
  type MergeResult,
  type Roster
} from '@/lib/roster'

declare global {
  var scoringRoster: Roster | undefined
}

export function getRoster(): Roster {
  if (!globalThis.scoringRoster) {
    globalThis.scoringRoster = createEmptyRoster()
  }
  return globalThis.scoringRoster
}

export function importRoster(drafts: DraftTeam[]): { roster: Roster; results: MergeResult[] } {
  const { roster, results } = mergeRoster(getRoster(), drafts, {
    now: new Date().toISOString(),
    nextId: () => randomUUID()
  })
  globalThis.scoringRoster = roster
  return { roster, results }
}

export function updateTeam(
  teamId: string,
  patch: { name?: string; division?: string; seed?: number | null }
): Roster {
  const roster = getRoster()
  const teams = roster.teams.map((team) => {
    if (team.id !== teamId) return team
    return {
      ...team,
      name: patch.name?.trim() || team.name,
      division: patch.division?.trim() || team.division,
      seed: patch.seed === null ? undefined : patch.seed ?? team.seed,
      updatedAt: new Date().toISOString()
    }
  })

  globalThis.scoringRoster = { ...roster, version: roster.version + 1, updatedAt: new Date().toISOString(), teams }
  return globalThis.scoringRoster
}

export function updatePlayer(
  teamId: string,
  playerId: string,
  patch: { firstName?: string; lastName?: string; email?: string | null; phone?: string | null }
): Roster {
  const roster = getRoster()
  const teams = roster.teams.map((team) => {
    if (team.id !== teamId) return team
    return {
      ...team,
      updatedAt: new Date().toISOString(),
      players: team.players.map((player) => {
        if (player.id !== playerId) return player
        return {
          ...player,
          firstName: patch.firstName?.trim() || player.firstName,
          lastName: patch.lastName?.trim() ?? player.lastName,
          email: patch.email === null ? undefined : patch.email?.trim() || player.email,
          phone: patch.phone === null ? undefined : patch.phone?.trim() || player.phone
        }
      })
    }
  })

  globalThis.scoringRoster = { ...roster, version: roster.version + 1, updatedAt: new Date().toISOString(), teams }
  return globalThis.scoringRoster
}

export function deleteTeam(teamId: string): Roster {
  const roster = getRoster()
  const teams = roster.teams.filter((team) => team.id !== teamId)
  globalThis.scoringRoster = { ...roster, version: roster.version + 1, updatedAt: new Date().toISOString(), teams }
  return globalThis.scoringRoster
}

export function resetRoster(): Roster {
  globalThis.scoringRoster = createEmptyRoster()
  return globalThis.scoringRoster
}
