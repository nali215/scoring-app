export type Sport = 'pickleball' | 'badminton'
export type TeamSide = 'A' | 'B'
export type GameStatus = 'not_started' | 'in_progress' | 'completed'
export type ServiceSide = 'left' | 'right'

export interface ScoringRules {
  sport: Sport
  pointsToWin: number
  winBy: number
  pointCap?: number
  bestOf: 1 | 3 | 5
  doubles: boolean
  sideOutScoring: boolean
  showServerNumber: boolean
}

export interface GameSnapshot {
  teamAScore: number
  teamBScore: number
  servingSide: TeamSide
  serverNumber: 1 | 2 | null
  firstServerExceptionActive: boolean
  serviceSide: ServiceSide | null
  status: GameStatus
  winnerSide: TeamSide | null
}

export interface ScoreResult {
  previous: GameSnapshot
  next: GameSnapshot
  events: Array<'POINT_AWARDED' | 'SIDE_OUT' | 'SERVER_CHANGED' | 'GAME_COMPLETED'>
}

export function otherSide(side: TeamSide): TeamSide {
  return side === 'A' ? 'B' : 'A'
}

export function scoreForSide(snapshot: GameSnapshot, side: TeamSide): number {
  return side === 'A' ? snapshot.teamAScore : snapshot.teamBScore
}

export function serviceSideForScore(score: number): ServiceSide {
  return score % 2 === 0 ? 'right' : 'left'
}

export function withPoint(snapshot: GameSnapshot, side: TeamSide): GameSnapshot {
  return side === 'A'
    ? { ...snapshot, teamAScore: snapshot.teamAScore + 1 }
    : { ...snapshot, teamBScore: snapshot.teamBScore + 1 }
}

