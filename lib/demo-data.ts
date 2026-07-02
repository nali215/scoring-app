export const activeMatches = [
  {
    court: 'Court 1',
    division: 'Mixed Doubles',
    teamA: 'Patel / Shah',
    teamB: 'Kim / Lopez',
    score: '8 - 6 - 2',
    status: 'In progress'
  },
  {
    court: 'Court 2',
    division: "Men's Singles",
    teamA: 'N. Ahmed',
    teamB: 'R. Chen',
    score: '19 - 18',
    status: 'Game point'
  },
  {
    court: 'Court 3',
    division: "Women's Doubles",
    teamA: 'Singh / Rao',
    teamB: 'Garcia / Ali',
    score: 'Scheduled',
    status: 'Warmup'
  }
]

export const operationalChecks = [
  'Rules lock before first serve',
  'One active scorekeeper lock per match',
  'Every score mutation writes an audit event',
  'TV displays use hashed read-only tokens',
  'Standings recompute by division after completion'
]

