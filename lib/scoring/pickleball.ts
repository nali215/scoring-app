import type { GameSnapshot, ScoreResult, ScoringRules, TeamSide } from './types'
import { otherSide, serviceSideForScore, withPoint } from './types'
import { assertPlayable, finalizeIfWon, serverScore, validateRules } from './validation'

export function createPickleballGame(rules: ScoringRules, servingSide: TeamSide = 'A'): GameSnapshot {
  validateRules(rules)

  return {
    teamAScore: 0,
    teamBScore: 0,
    servingSide,
    serverNumber: rules.doubles ? 2 : null,
    firstServerExceptionActive: rules.doubles,
    serviceSide: 'right',
    status: 'in_progress',
    winnerSide: null
  }
}

export function awardPickleballRally(
  snapshot: GameSnapshot,
  rallyWinner: TeamSide,
  rules: ScoringRules
): ScoreResult {
  if (rules.sport !== 'pickleball') {
    throw new Error('Pickleball engine requires pickleball rules')
  }

  assertPlayable(snapshot)
  validateRules(rules)

  const previous = snapshot
  const events: ScoreResult['events'] = []
  let next = snapshot

  if (!rules.sideOutScoring) {
    next = finalizeIfWon(
      {
        ...withPoint(snapshot, rallyWinner),
        servingSide: rallyWinner,
        serviceSide: serviceSideForScore(rallyWinner === 'A' ? snapshot.teamAScore + 1 : snapshot.teamBScore + 1),
        firstServerExceptionActive: false,
        serverNumber: rules.doubles ? 1 : null
      },
      rules
    )
    events.push('POINT_AWARDED')
    if (next.status === 'completed') events.push('GAME_COMPLETED')
    return { previous, next, events }
  }

  if (snapshot.servingSide === rallyWinner) {
    next = finalizeIfWon(
      {
        ...withPoint(snapshot, rallyWinner),
        serviceSide: serviceSideForScore(serverScore(withPoint(snapshot, rallyWinner)))
      },
      rules
    )
    events.push('POINT_AWARDED')
    if (next.status === 'completed') events.push('GAME_COMPLETED')
    return { previous, next, events }
  }

  next = rotateServe(snapshot, rules)
  events.push(next.servingSide === snapshot.servingSide ? 'SERVER_CHANGED' : 'SIDE_OUT')
  return { previous, next, events }
}

function rotateServe(snapshot: GameSnapshot, rules: ScoringRules): GameSnapshot {
  if (!rules.doubles) {
    const servingSide = otherSide(snapshot.servingSide)
    return {
      ...snapshot,
      servingSide,
      serviceSide: serviceSideForScore(servingSide === 'A' ? snapshot.teamAScore : snapshot.teamBScore)
    }
  }

  if (snapshot.firstServerExceptionActive || snapshot.serverNumber === 2) {
    const servingSide = otherSide(snapshot.servingSide)
    return {
      ...snapshot,
      servingSide,
      serverNumber: 1,
      firstServerExceptionActive: false,
      serviceSide: serviceSideForScore(servingSide === 'A' ? snapshot.teamAScore : snapshot.teamBScore)
    }
  }

  return {
    ...snapshot,
    serverNumber: 2,
    serviceSide: serviceSideForScore(serverScore(snapshot))
  }
}

