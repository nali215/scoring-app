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
    timeWindow: '9:00 AM - 6:00 PM',
    status: 'Live demo',
    divisions: ['Mixed Doubles', "Men's Singles", "Men's Doubles", "Women's Doubles"],
    courts: 4,
    publicSummary: 'Live scores, schedules, court assignments, and standings are visible without login.',
    format: 'Pool play into single-elimination playoffs',
    regularFormat: 'Best of 3 games to 21, win by 2, cap at 30',
    playoffFormat: 'Best of 5 games to 21, win by 2, cap at 30',
    visibility: 'Published'
  },
  {
    name: 'Pickleball Sunday Ladder',
    slug: 'pickleball-sunday-ladder',
    sport: 'Pickleball',
    venue: 'Community Courts',
    date: 'Sunday, July 26',
    timeWindow: '8:30 AM - 2:00 PM',
    status: 'Draft',
    divisions: ["Men's Doubles", "Women's Doubles", 'Mixed Doubles'],
    courts: 3,
    publicSummary: 'Draft tournament example. Admin can hide schedules until ready.',
    format: 'Round robin with top 4 playoff',
    regularFormat: 'Best of 3 games to 11, win by 2',
    playoffFormat: 'Best of 3 games to 15, win by 2',
    visibility: 'Hidden until published'
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

export const badmintonDemoSchedule = [
  {
    time: '9:00 AM',
    court: 'Court 1',
    division: 'Mixed Doubles',
    match: 'Rahman / Ali vs Chen / Patel',
    phase: 'Pool A',
    status: 'Completed'
  },
  {
    time: '9:00 AM',
    court: 'Court 2',
    division: "Men's Singles",
    match: 'Omar Khan vs Daniel Kim',
    phase: 'Pool B',
    status: 'Submitted'
  },
  {
    time: '9:35 AM',
    court: 'Court 3',
    division: "Women's Doubles",
    match: 'Garcia / Singh vs Rao / Lopez',
    phase: 'Pool A',
    status: 'Live'
  },
  {
    time: '9:35 AM',
    court: 'Court 4',
    division: "Men's Singles",
    match: 'Samir Shah vs Leo Nguyen',
    phase: 'Pool A',
    status: 'Queued'
  },
  {
    time: '10:10 AM',
    court: 'Court 1',
    division: "Men's Doubles",
    match: 'Ahmed / Shah vs Park / Wong',
    phase: 'Pool B',
    status: 'Scheduled'
  },
  {
    time: '10:10 AM',
    court: 'Court 2',
    division: 'Mixed Doubles',
    match: 'Singh / Rao vs Kim / Lopez',
    phase: 'Pool B',
    status: 'Scheduled'
  }
]

export const courtViews = [
  {
    court: 'Court 1',
    match: 'Rahman / Ali vs Chen / Patel',
    score: '21-17, 16-14',
    state: 'Live',
    scorekeeper: 'Aisha'
  },
  {
    court: 'Court 2',
    match: 'Omar Khan vs Daniel Kim',
    score: '21-18, 21-19',
    state: 'Submitted',
    scorekeeper: 'Marcus'
  },
  {
    court: 'Court 3',
    match: 'Garcia / Singh vs Rao / Lopez',
    score: '19-21, 21-15, 8-6',
    state: 'Live',
    scorekeeper: 'Nina'
  },
  {
    court: 'Court 4',
    match: 'Samir Shah vs Leo Nguyen',
    score: 'Starts 9:35 AM',
    state: 'Queued',
    scorekeeper: 'Unassigned'
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

export const demoTeams = [
  { division: 'Mixed Doubles', team: 'Rahman / Ali', players: 'Maya Rahman, Naveed Ali', seed: 1 },
  { division: 'Mixed Doubles', team: 'Chen / Patel', players: 'Ricky Chen, Dev Patel', seed: 2 },
  { division: "Men's Singles", team: 'Omar Khan', players: 'Omar Khan', seed: 1 },
  { division: "Men's Singles", team: 'Daniel Kim', players: 'Daniel Kim', seed: 2 },
  { division: "Women's Doubles", team: 'Garcia / Singh', players: 'Elena Garcia, Priya Singh', seed: 1 },
  { division: "Women's Doubles", team: 'Rao / Lopez', players: 'Anika Rao, Sofia Lopez', seed: 2 }
]

export const importColumns = [
  { fileColumn: 'Division', mappedTo: 'division', sample: 'Mixed Doubles' },
  { fileColumn: 'Team Name', mappedTo: 'teamName', sample: 'Rahman / Ali' },
  { fileColumn: 'Player 1 First', mappedTo: 'playerOneFirstName', sample: 'Maya' },
  { fileColumn: 'Player 1 Last', mappedTo: 'playerOneLastName', sample: 'Rahman' },
  { fileColumn: 'Player 2 First', mappedTo: 'playerTwoFirstName', sample: 'Naveed' },
  { fileColumn: 'Player 2 Last', mappedTo: 'playerTwoLastName', sample: 'Ali' },
  { fileColumn: 'Email', mappedTo: 'email', sample: 'player@example.com' }
]

export const sportDefaults = [
  {
    sport: 'Badminton',
    regular: 'Best of 3 games to 21, rally scoring, win by 2, cap at 30',
    playoffs: 'Best of 5 games to 21, rally scoring, win by 2, cap at 30',
    formats: ['Round robin', 'Pool play + playoffs', 'Single elimination']
  },
  {
    sport: 'Pickleball',
    regular: 'Best of 3 games to 11, side-out scoring, win by 2',
    playoffs: 'Best of 3 games to 15 or 21, win by 2',
    formats: ['Round robin', 'Pool play + playoffs', 'Ladder into playoffs']
  }
]

export const divisionOptions = [
  "Men's Singles",
  "Women's Singles",
  "Kids Singles",
  "Men's Doubles",
  "Women's Doubles",
  "Kids Doubles",
  'Mixed Doubles'
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
