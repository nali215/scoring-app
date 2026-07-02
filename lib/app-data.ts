export type TournamentSummary = {
  name: string
  slug: string
  sport: 'Badminton' | 'Pickleball'
  venue: string
  date: string
  timeWindow: string
  status: 'Draft' | 'Published' | 'Live' | 'Completed'
  divisions: string[]
  courts: number
  visibility: 'Public' | 'Private'
}

export type MatchRow = {
  court: string
  division: string
  round: string
  teamA: string
  teamB: string
  score: string
  status: string
  editableBy: string
  time: string
}

export type StandingRow = {
  rank: number
  team: string
  division: string
  played: number
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  differential: number
}

export type ScheduleRow = {
  time: string
  court: string
  division: string
  match: string
  phase: string
  status: string
}

export const tournaments: TournamentSummary[] = []

export const divisionOptions = [
  "Men's Singles",
  "Women's Singles",
  "Kids Singles",
  "Men's Doubles",
  "Women's Doubles",
  "Kids Doubles",
  'Mixed Doubles'
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

export const importColumnOptions = [
  'Division',
  'Team Name',
  'Player 1 First Name',
  'Player 1 Last Name',
  'Player 2 First Name',
  'Player 2 Last Name',
  'Email',
  'Phone',
  'Seed'
]

export const adminScheduleActions = [
  'Move match to another court',
  'Change match start time',
  'Swap match order on a court',
  'Assign or replace scorekeeper',
  'Reopen submitted match for correction',
  'Regenerate remaining schedule after edits'
]

export const setupSteps = [
  ['Create tournament', 'Name, venue, sport, public visibility, and tournament dates.'],
  ['Select divisions', 'Enable only the categories used for this event.'],
  ['Import roster', 'Upload CSV/XLSX, map columns, preview, and fix teams before scheduling.'],
  ['Configure formats', 'Set regular games, playoff games, tiebreakers, courts, and time blocks.'],
  ['Generate schedule', 'Assign matches to courts, adjust times, and assign scorekeepers.'],
  ['Publish', 'Open the public tournament page and live display views when ready.']
]

