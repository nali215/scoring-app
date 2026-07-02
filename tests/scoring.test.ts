import { describe, expect, it } from 'vitest'
import {
  awardBadmintonRally,
  awardPickleballRally,
  createBadmintonGame,
  createPickleballGame,
  matchWinner,
  type ScoringRules
} from '@/lib/scoring'

const pickleballDoubles: ScoringRules = {
  sport: 'pickleball',
  pointsToWin: 11,
  winBy: 2,
  bestOf: 3,
  doubles: true,
  sideOutScoring: true,
  showServerNumber: true
}

const badminton: ScoringRules = {
  sport: 'badminton',
  pointsToWin: 21,
  winBy: 2,
  pointCap: 30,
  bestOf: 3,
  doubles: true,
  sideOutScoring: false,
  showServerNumber: false
}

describe('pickleball scoring', () => {
  it('starts doubles with the first-server exception', () => {
    const game = createPickleballGame(pickleballDoubles)

    expect(game.serverNumber).toBe(2)
    expect(game.firstServerExceptionActive).toBe(true)
    expect(game.servingSide).toBe('A')
  })

  it('side-outs immediately on the first receiving rally win', () => {
    const game = createPickleballGame(pickleballDoubles)
    const result = awardPickleballRally(game, 'B', pickleballDoubles)

    expect(result.events).toEqual(['SIDE_OUT'])
    expect(result.next.teamAScore).toBe(0)
    expect(result.next.teamBScore).toBe(0)
    expect(result.next.servingSide).toBe('B')
    expect(result.next.serverNumber).toBe(1)
    expect(result.next.firstServerExceptionActive).toBe(false)
  })

  it('moves from server one to server two before side-out', () => {
    const afterFirstSideOut = awardPickleballRally(createPickleballGame(pickleballDoubles), 'B', pickleballDoubles).next
    const result = awardPickleballRally(afterFirstSideOut, 'A', pickleballDoubles)

    expect(result.events).toEqual(['SERVER_CHANGED'])
    expect(result.next.servingSide).toBe('B')
    expect(result.next.serverNumber).toBe(2)
  })
})

describe('badminton scoring', () => {
  it('uses rally scoring and assigns service to the rally winner', () => {
    const result = awardBadmintonRally(createBadmintonGame('A'), 'B', badminton)

    expect(result.next.teamBScore).toBe(1)
    expect(result.next.servingSide).toBe('B')
    expect(result.next.serviceSide).toBe('left')
  })

  it('honors the point cap', () => {
    let game = createBadmintonGame('A')
    for (let i = 0; i < 29; i += 1) {
      game = awardBadmintonRally(game, i % 2 === 0 ? 'A' : 'B', badminton).next
    }

    const result = awardBadmintonRally({ ...game, teamAScore: 29, teamBScore: 29 }, 'A', badminton)

    expect(result.next.teamAScore).toBe(30)
    expect(result.next.status).toBe('completed')
    expect(result.next.winnerSide).toBe('A')
  })
})

describe('match completion', () => {
  it('requires a majority of games in best-of-three', () => {
    expect(matchWinner(['A'], pickleballDoubles)).toBeNull()
    expect(matchWinner(['A', 'B'], pickleballDoubles)).toBeNull()
    expect(matchWinner(['A', 'B', 'A'], pickleballDoubles)).toBe('A')
  })
})

