import { describe, expect, it } from 'vitest'
import { calculateStandings, type CompletedMatchScore, type TeamRef } from '@/lib/standings'

const teams: TeamRef[] = [
  { id: 'a', name: 'Team A' },
  { id: 'b', name: 'Team B' },
  { id: 'c', name: 'Team C' },
  { id: 'd', name: 'Team D' }
]

describe('standings tiebreakers', () => {
  it('uses head-to-head for a two-way tie', () => {
    const matches: CompletedMatchScore[] = [
      { id: 'ab', division: 'Mixed', teamAId: 'a', teamBId: 'b', games: [{ teamAScore: 21, teamBScore: 18 }] },
      { id: 'ca', division: 'Mixed', teamAId: 'c', teamBId: 'a', games: [{ teamAScore: 21, teamBScore: 16 }] },
      { id: 'bc', division: 'Mixed', teamAId: 'b', teamBId: 'c', games: [{ teamAScore: 21, teamBScore: 19 }] },
      { id: 'cd', division: 'Mixed', teamAId: 'c', teamBId: 'd', games: [{ teamAScore: 21, teamBScore: 10 }] }
    ]

    const standings = calculateStandings({ sport: 'badminton', teams, matches })

    expect(standings.map((standing) => standing.teamId)).toEqual(['c', 'a', 'b', 'd'])
    expect(standings[1].tieBreakSummary).toContain('Two-way tie resolved by head-to-head result')
  })

  it('uses badminton games differential before points differential in a three-way tie', () => {
    const matches: CompletedMatchScore[] = [
      {
        id: 'ab',
        division: 'Mixed',
        teamAId: 'a',
        teamBId: 'b',
        games: [
          { teamAScore: 21, teamBScore: 10 },
          { teamAScore: 21, teamBScore: 10 }
        ]
      },
      {
        id: 'bc',
        division: 'Mixed',
        teamAId: 'b',
        teamBId: 'c',
        games: [
          { teamAScore: 21, teamBScore: 18 },
          { teamAScore: 18, teamBScore: 21 },
          { teamAScore: 21, teamBScore: 19 }
        ]
      },
      {
        id: 'ca',
        division: 'Mixed',
        teamAId: 'c',
        teamBId: 'a',
        games: [
          { teamAScore: 21, teamBScore: 18 },
          { teamAScore: 17, teamBScore: 21 },
          { teamAScore: 21, teamBScore: 19 }
        ]
      }
    ]

    const standings = calculateStandings({ sport: 'badminton', teams: teams.slice(0, 3), matches })

    expect(standings.map((standing) => standing.teamId)).toEqual(['a', 'c', 'b'])
    expect(standings.map((standing) => standing.wins)).toEqual([1, 1, 1])
    expect(standings[0].gameDifferential).toBe(1)
    expect(standings[1].gameDifferential).toBe(0)
    expect(standings[2].gameDifferential).toBe(-1)
  })

  it('uses pickleball point differential among tied teams in a three-way tie', () => {
    const matches: CompletedMatchScore[] = [
      { id: 'ab', division: 'Mixed', teamAId: 'a', teamBId: 'b', games: [{ teamAScore: 11, teamBScore: 3 }] },
      { id: 'bc', division: 'Mixed', teamAId: 'b', teamBId: 'c', games: [{ teamAScore: 11, teamBScore: 8 }] },
      { id: 'ca', division: 'Mixed', teamAId: 'c', teamBId: 'a', games: [{ teamAScore: 11, teamBScore: 9 }] }
    ]

    const standings = calculateStandings({ sport: 'pickleball', teams: teams.slice(0, 3), matches })

    expect(standings.map((standing) => standing.teamId)).toEqual(['a', 'c', 'b'])
    expect(standings.map((standing) => standing.wins)).toEqual([1, 1, 1])
    expect(standings[0].pointDifferential).toBe(6)
    expect(standings[1].pointDifferential).toBe(-1)
    expect(standings[2].pointDifferential).toBe(-5)
  })
})
