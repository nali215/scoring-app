export type StandingsSport = 'badminton' | 'pickleball'

export type TeamRef = {
  id: string
  name: string
}

export type CompletedGameScore = {
  teamAScore: number
  teamBScore: number
}

export type CompletedMatchScore = {
  id: string
  division: string
  teamAId: string
  teamBId: string
  games: CompletedGameScore[]
}

export type TeamStanding = {
  rank: number
  teamId: string
  teamName: string
  played: number
  wins: number
  losses: number
  gamesWon: number
  gamesLost: number
  gameDifferential: number
  pointsFor: number
  pointsAgainst: number
  pointDifferential: number
  tieBreakSummary: string[]
}

type MutableStanding = Omit<TeamStanding, 'rank'> & { rank?: number }

type TieStats = {
  pointsFor: number
  pointsAgainst: number
  pointDifferential: number
}

export function calculateStandings({
  sport,
  teams,
  matches
}: {
  sport: StandingsSport
  teams: TeamRef[]
  matches: CompletedMatchScore[]
}): TeamStanding[] {
  const standings = new Map<string, MutableStanding>()

  for (const team of teams) {
    standings.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      wins: 0,
      losses: 0,
      gamesWon: 0,
      gamesLost: 0,
      gameDifferential: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDifferential: 0,
      tieBreakSummary: []
    })
  }

  for (const match of matches) {
    const teamA = standings.get(match.teamAId)
    const teamB = standings.get(match.teamBId)

    if (!teamA || !teamB) {
      throw new Error(`Match ${match.id} references a team that is not in the standings set`)
    }

    const result = summarizeMatch(match)
    teamA.played += 1
    teamB.played += 1

    teamA.gamesWon += result.teamAGamesWon
    teamA.gamesLost += result.teamBGamesWon
    teamB.gamesWon += result.teamBGamesWon
    teamB.gamesLost += result.teamAGamesWon

    teamA.pointsFor += result.teamAPoints
    teamA.pointsAgainst += result.teamBPoints
    teamB.pointsFor += result.teamBPoints
    teamB.pointsAgainst += result.teamAPoints

    if (result.winnerTeamId === match.teamAId) {
      teamA.wins += 1
      teamB.losses += 1
    } else {
      teamB.wins += 1
      teamA.losses += 1
    }
  }

  for (const standing of standings.values()) {
    standing.gameDifferential = standing.gamesWon - standing.gamesLost
    standing.pointDifferential = standing.pointsFor - standing.pointsAgainst
  }

  const ranked = resolveTies(Array.from(standings.values()), matches, sport)

  return ranked.map((standing, index) => ({
    ...standing,
    rank: index + 1
  }))
}

function summarizeMatch(match: CompletedMatchScore) {
  let teamAGamesWon = 0
  let teamBGamesWon = 0
  let teamAPoints = 0
  let teamBPoints = 0

  for (const game of match.games) {
    teamAPoints += game.teamAScore
    teamBPoints += game.teamBScore

    if (game.teamAScore > game.teamBScore) {
      teamAGamesWon += 1
    } else if (game.teamBScore > game.teamAScore) {
      teamBGamesWon += 1
    } else {
      throw new Error(`Match ${match.id} contains a tied completed game`)
    }
  }

  if (teamAGamesWon === teamBGamesWon) {
    throw new Error(`Match ${match.id} does not have a match winner`)
  }

  return {
    teamAGamesWon,
    teamBGamesWon,
    teamAPoints,
    teamBPoints,
    winnerTeamId: teamAGamesWon > teamBGamesWon ? match.teamAId : match.teamBId
  }
}

function resolveTies(standings: MutableStanding[], matches: CompletedMatchScore[], sport: StandingsSport): MutableStanding[] {
  const byWins = new Map<number, MutableStanding[]>()

  for (const standing of standings.toSorted((a, b) => b.wins - a.wins)) {
    const group = byWins.get(standing.wins) ?? []
    group.push(standing)
    byWins.set(standing.wins, group)
  }

  return Array.from(byWins.values()).flatMap((group) => resolveWinTieGroup(group, matches, sport))
}

function resolveWinTieGroup(group: MutableStanding[], matches: CompletedMatchScore[], sport: StandingsSport): MutableStanding[] {
  if (group.length <= 1) return group

  if (group.length === 2) {
    const headToHeadWinner = getHeadToHeadWinner(group[0].teamId, group[1].teamId, matches)
    if (headToHeadWinner) {
      return group
        .toSorted((a, b) => (a.teamId === headToHeadWinner ? -1 : b.teamId === headToHeadWinner ? 1 : 0))
        .map((standing) => ({
          ...standing,
          tieBreakSummary: [...standing.tieBreakSummary, 'Two-way tie resolved by head-to-head result']
        }))
    }
  }

  if (sport === 'badminton') {
    return group.toSorted((a, b) => {
      return (
        b.gameDifferential - a.gameDifferential ||
        b.pointDifferential - a.pointDifferential ||
        b.pointsFor - a.pointsFor ||
        a.pointsAgainst - b.pointsAgainst ||
        a.teamName.localeCompare(b.teamName)
      )
    }).map((standing) => ({
      ...standing,
      tieBreakSummary: [
        ...standing.tieBreakSummary,
        group.length === 2
          ? 'Tie unresolved by head-to-head; sorted by games differential, points differential, points scored'
          : 'Multi-team tie sorted by games differential, then points differential, then points scored'
      ]
    }))
  }

  const tiedTeamIds = new Set(group.map((standing) => standing.teamId))
  const tiedPointStats = getPointStatsWithinTie(tiedTeamIds, matches)

  return group.toSorted((a, b) => {
    const aTieStats = tiedPointStats.get(a.teamId) ?? emptyTieStats()
    const bTieStats = tiedPointStats.get(b.teamId) ?? emptyTieStats()

    return (
      bTieStats.pointDifferential - aTieStats.pointDifferential ||
      bTieStats.pointsFor - aTieStats.pointsFor ||
      aTieStats.pointsAgainst - bTieStats.pointsAgainst ||
      b.pointDifferential - a.pointDifferential ||
      b.pointsFor - a.pointsFor ||
      a.pointsAgainst - b.pointsAgainst ||
      a.teamName.localeCompare(b.teamName)
    )
  }).map((standing) => ({
    ...standing,
    tieBreakSummary: [
      ...standing.tieBreakSummary,
      'Multi-team tie sorted by point differential among tied teams, then points scored, then points allowed'
    ]
  }))
}

function getHeadToHeadWinner(teamAId: string, teamBId: string, matches: CompletedMatchScore[]): string | null {
  let teamAWins = 0
  let teamBWins = 0

  for (const match of matches) {
    const involvesBoth =
      (match.teamAId === teamAId && match.teamBId === teamBId) ||
      (match.teamAId === teamBId && match.teamBId === teamAId)

    if (!involvesBoth) continue

    const result = summarizeMatch(match)
    if (result.winnerTeamId === teamAId) teamAWins += 1
    if (result.winnerTeamId === teamBId) teamBWins += 1
  }

  if (teamAWins === teamBWins) return null
  return teamAWins > teamBWins ? teamAId : teamBId
}

function getPointStatsWithinTie(teamIds: Set<string>, matches: CompletedMatchScore[]) {
  const stats = new Map<string, TieStats>()

  for (const teamId of teamIds) {
    stats.set(teamId, emptyTieStats())
  }

  for (const match of matches) {
    if (!teamIds.has(match.teamAId) || !teamIds.has(match.teamBId)) continue

    const result = summarizeMatch(match)
    const teamA = stats.get(match.teamAId)
    const teamB = stats.get(match.teamBId)

    if (!teamA || !teamB) continue

    teamA.pointsFor += result.teamAPoints
    teamA.pointsAgainst += result.teamBPoints
    teamB.pointsFor += result.teamBPoints
    teamB.pointsAgainst += result.teamAPoints
  }

  for (const stat of stats.values()) {
    stat.pointDifferential = stat.pointsFor - stat.pointsAgainst
  }

  return stats
}

function emptyTieStats(): TieStats {
  return {
    pointsFor: 0,
    pointsAgainst: 0,
    pointDifferential: 0
  }
}
