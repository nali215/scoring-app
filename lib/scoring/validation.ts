import type { GameSnapshot, ScoringRules, TeamSide } from './types'
import { scoreForSide } from './types'

export function assertPlayable(snapshot: GameSnapshot): void {
  if (snapshot.status === 'completed') {
    throw new Error('Cannot score a completed game')
  }
}

export function gameWinner(snapshot: GameSnapshot, rules: ScoringRules): TeamSide | null {
  const scores: Array<[TeamSide, number, number]> = [
    ['A', snapshot.teamAScore, snapshot.teamBScore],
    ['B', snapshot.teamBScore, snapshot.teamAScore]
  ]

  for (const [side, score, opponentScore] of scores) {
    if (rules.pointCap !== undefined && score >= rules.pointCap) {
      return side
    }

    if (score >= rules.pointsToWin && score - opponentScore >= rules.winBy) {
      return side
    }
  }

  return null
}

export function finalizeIfWon(snapshot: GameSnapshot, rules: ScoringRules): GameSnapshot {
  const winnerSide = gameWinner(snapshot, rules)

  if (!winnerSide) {
    return { ...snapshot, status: 'in_progress', winnerSide: null }
  }

  return {
    ...snapshot,
    status: 'completed',
    winnerSide
  }
}

export function gamesNeededToWin(bestOf: ScoringRules['bestOf']): number {
  return Math.floor(bestOf / 2) + 1
}

export function matchWinner(gameWinners: TeamSide[], rules: ScoringRules): TeamSide | null {
  const needed = gamesNeededToWin(rules.bestOf)
  const aWins = gameWinners.filter((side) => side === 'A').length
  const bWins = gameWinners.filter((side) => side === 'B').length

  if (aWins >= needed) return 'A'
  if (bWins >= needed) return 'B'
  return null
}

export function validateRules(rules: ScoringRules): void {
  if (rules.pointsToWin < 1) throw new Error('pointsToWin must be positive')
  if (rules.winBy < 1) throw new Error('winBy must be positive')
  if (rules.pointCap !== undefined && rules.pointCap < rules.pointsToWin) {
    throw new Error('pointCap cannot be lower than pointsToWin')
  }
  if (!rules.doubles && rules.showServerNumber) {
    throw new Error('server number display only applies to doubles')
  }
}

export function serverScore(snapshot: GameSnapshot): number {
  return scoreForSide(snapshot, snapshot.servingSide)
}

