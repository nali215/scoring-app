import type { GameSnapshot, ScoreResult, ScoringRules, TeamSide } from './types'
import { serviceSideForScore, withPoint } from './types'
import { assertPlayable, finalizeIfWon, validateRules } from './validation'

export function createBadmintonGame(servingSide: TeamSide = 'A'): GameSnapshot {
  return {
    teamAScore: 0,
    teamBScore: 0,
    servingSide,
    serverNumber: null,
    firstServerExceptionActive: false,
    serviceSide: 'right',
    status: 'in_progress',
    winnerSide: null
  }
}

export function awardBadmintonRally(
  snapshot: GameSnapshot,
  rallyWinner: TeamSide,
  rules: ScoringRules
): ScoreResult {
  if (rules.sport !== 'badminton') {
    throw new Error('Badminton engine requires badminton rules')
  }

  assertPlayable(snapshot)
  validateRules(rules)

  const scored = withPoint(snapshot, rallyWinner)
  const winnerScore = rallyWinner === 'A' ? scored.teamAScore : scored.teamBScore
  const next = finalizeIfWon(
    {
      ...scored,
      servingSide: rallyWinner,
      serviceSide: serviceSideForScore(winnerScore)
    },
    rules
  )

  return {
    previous: snapshot,
    next,
    events: next.status === 'completed' ? ['POINT_AWARDED', 'GAME_COMPLETED'] : ['POINT_AWARDED']
  }
}

