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

export const demoTournaments = [
  {
    name: 'Badminton Winter Classic',
    slug: 'badminton-winter-classic',
    sport: 'Badminton',
    venue: 'Naveed Sports Center',
    date: 'Saturday, July 18',
    status: 'Live demo',
    divisions: ['Mixed Doubles', "Men's Singles", "Women's Doubles"],
    courts: 4,
    publicSummary: 'Live scores, court assignments, and standings are visible without login.'
  }
]

export const badmintonDemoMatches = [
  {
    court: 'Court 1',
    division: 'Mixed Doubles',
    round: 'Pool A · Match 4',
    teamA: 'Rahman / Ali',
    teamB: 'Chen / Patel',
    score: '21-17, 16-14',
    status: 'Game 2 live',
    scorekeeper: 'Aisha',
    editableBy: 'Scorekeeper while live'
  },
  {
    court: 'Court 2',
    division: "Men's Singles",
    round: 'Pool B · Match 3',
    teamA: 'Omar Khan',
    teamB: 'Daniel Kim',
    score: '21-18, 21-19',
    status: 'Submitted',
    scorekeeper: 'Marcus',
    editableBy: 'Admin only'
  },
  {
    court: 'Court 3',
    division: "Women's Doubles",
    round: 'Pool A · Match 2',
    teamA: 'Garcia / Singh',
    teamB: 'Rao / Lopez',
    score: '19-21, 21-15, 8-6',
    status: 'Game 3 live',
    scorekeeper: 'Nina',
    editableBy: 'Scorekeeper while live'
  },
  {
    court: 'Court 4',
    division: "Men's Singles",
    round: 'Pool A · Match 5',
    teamA: 'Samir Shah',
    teamB: 'Leo Nguyen',
    score: 'Scheduled 2:40 PM',
    status: 'Queued',
    scorekeeper: 'Unassigned',
    editableBy: 'Not started'
  }
]

export const badmintonDemoStandings = [
  {
    rank: 1,
    team: 'Chen / Patel',
    division: 'Mixed Doubles',
    played: 4,
    wins: 4,
    losses: 0,
    pointsFor: 164,
    pointsAgainst: 121,
    differential: 43
  },
  {
    rank: 2,
    team: 'Rahman / Ali',
    division: 'Mixed Doubles',
    played: 4,
    wins: 3,
    losses: 1,
    pointsFor: 153,
    pointsAgainst: 134,
    differential: 19
  },
  {
    rank: 3,
    team: 'Omar Khan',
    division: "Men's Singles",
    played: 3,
    wins: 3,
    losses: 0,
    pointsFor: 126,
    pointsAgainst: 102,
    differential: 24
  },
  {
    rank: 4,
    team: 'Garcia / Singh',
    division: "Women's Doubles",
    played: 3,
    wins: 2,
    losses: 1,
    pointsFor: 118,
    pointsAgainst: 111,
    differential: 7
  }
]

export const scorekeeperAssignments = [
  {
    court: 'Court 1',
    match: 'Rahman / Ali vs Chen / Patel',
    division: 'Mixed Doubles',
    state: 'Live',
    owner: 'Aisha',
    action: 'Continue scoring'
  },
  {
    court: 'Court 2',
    match: 'Omar Khan vs Daniel Kim',
    division: "Men's Singles",
    state: 'Submitted',
    owner: 'Marcus',
    action: 'Locked'
  },
  {
    court: 'Court 3',
    match: 'Garcia / Singh vs Rao / Lopez',
    division: "Women's Doubles",
    state: 'Live',
    owner: 'Nina',
    action: 'Continue scoring'
  }
]

export const operationalChecks = [
  'Rules lock before first serve',
  'One active scorekeeper lock per match',
  'Every score mutation writes an audit event',
  'TV displays use hashed read-only tokens',
  'Standings recompute by division after completion'
]
