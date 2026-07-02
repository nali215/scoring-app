import { badmintonDemoMatches, badmintonDemoSchedule, badmintonDemoStandings, courtViews } from '@/lib/demo-data'

export type LiveMatch = {
  id: string
  scheduleIndex: number
  court: string
  time: string
  division: string
  round: string
  teamA: string
  teamB: string
  teamAScore: number
  teamBScore: number
  score: string
  status: string
  scorekeeper: string
  editableBy: string
  submitted: boolean
  completed: boolean
  lastUpdatedAt: string
}

export type LiveCourt = {
  court: string
  match: string
  score: string
  state: string
  scorekeeper: string
}

export type LiveDemoState = {
  version: number
  updatedAt: string
  matches: LiveMatch[]
  courts: LiveCourt[]
  standings: typeof badmintonDemoStandings
  schedule: typeof badmintonDemoSchedule
}

type LiveAction =
  | { action: 'awardPoint'; matchId: string; side: 'A' | 'B' }
  | { action: 'submitMatch'; matchId: string }
  | { action: 'reopenMatch'; matchId: string }
  | { action: 'reset' }

declare global {
  var scoringLiveDemoState: LiveDemoState | undefined
}

export function getLiveDemoState(): LiveDemoState {
  if (!globalThis.scoringLiveDemoState) {
    globalThis.scoringLiveDemoState = createInitialLiveDemoState()
  }

  return globalThis.scoringLiveDemoState
}

export function applyLiveDemoAction(action: LiveAction): LiveDemoState {
  if (action.action === 'reset') {
    globalThis.scoringLiveDemoState = createInitialLiveDemoState()
    return globalThis.scoringLiveDemoState
  }

  const state = getLiveDemoState()
  const matchIndex = state.matches.findIndex((match) => match.id === action.matchId)

  if (matchIndex === -1) {
    throw new Error('Match not found')
  }

  const match = state.matches[matchIndex]

  if (match.submitted && action.action !== 'reopenMatch') {
    throw new Error('Submitted matches are locked. Only admin correction can edit them.')
  }

  const now = new Date().toISOString()
  let nextMatch: LiveMatch

  if (action.action === 'awardPoint') {
    nextMatch = updateMatchScore(match, action.side, now)
  } else if (action.action === 'submitMatch') {
    nextMatch = {
      ...match,
      status: 'Final',
      submitted: true,
      completed: true,
      editableBy: 'Admin only',
      lastUpdatedAt: now
    }
  } else {
    nextMatch = {
      ...match,
      status: 'Live',
      submitted: false,
      completed: false,
      editableBy: 'Scorekeeper while live',
      lastUpdatedAt: now
    }
  }

  const matches = [...state.matches]
  matches[matchIndex] = nextMatch
  const nextScheduledMatch = action.action === 'submitMatch' ? getNextScheduledMatch(match.court, matches, now) : null

  if (nextScheduledMatch) {
    matches.push(nextScheduledMatch)
  }

  globalThis.scoringLiveDemoState = {
    ...state,
    version: state.version + 1,
    updatedAt: now,
    matches,
    courts: buildCourts(matches)
  }

  return globalThis.scoringLiveDemoState
}

function createInitialLiveDemoState(): LiveDemoState {
  const now = new Date().toISOString()
  const matches = badmintonDemoMatches.map((match, index): LiveMatch => {
    const liveScore = index === 0 ? { teamAScore: 16, teamBScore: 14 } : parseLiveScore(match.score)

    return {
      id: `match-${index + 1}`,
      scheduleIndex: index,
      court: match.court,
      time: badmintonDemoSchedule[index]?.time ?? 'TBD',
      division: match.division,
      round: match.round,
      teamA: match.teamA,
      teamB: match.teamB,
      teamAScore: liveScore.teamAScore,
      teamBScore: liveScore.teamBScore,
      score: index === 0 ? formatLiveScore(match.score, liveScore.teamAScore, liveScore.teamBScore) : match.score,
      status: match.status,
      scorekeeper: match.scorekeeper,
      editableBy: match.editableBy,
      submitted: match.editableBy === 'Admin only',
      completed: match.editableBy === 'Admin only',
      lastUpdatedAt: now
    }
  })

  return {
    version: 1,
    updatedAt: now,
    matches,
    courts: buildCourts(matches),
    standings: badmintonDemoStandings,
    schedule: badmintonDemoSchedule
  }
}

function updateMatchScore(match: LiveMatch, side: 'A' | 'B', updatedAt: string): LiveMatch {
  const teamAScore = side === 'A' ? match.teamAScore + 1 : match.teamAScore
  const teamBScore = side === 'B' ? match.teamBScore + 1 : match.teamBScore

  return {
    ...match,
    teamAScore,
    teamBScore,
    score: formatLiveScore(match.score, teamAScore, teamBScore),
    status: 'Live',
    editableBy: 'Scorekeeper while live',
    lastUpdatedAt: updatedAt
  }
}

function buildCourts(matches: LiveMatch[]): LiveCourt[] {
  const courts = Array.from(new Set(matches.map((match) => match.court))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  return courts.map((court) => {
    const courtMatches = matches
      .filter((match) => match.court === court)
      .toSorted((a, b) => a.scheduleIndex - b.scheduleIndex)
    const currentMatch = courtMatches.find((match) => !match.submitted) ?? courtMatches.at(-1)

    if (!currentMatch) {
      return {
        court,
        match: 'No match assigned',
        score: 'Idle',
        state: 'Idle',
        scorekeeper: 'Unassigned'
      }
    }

    return {
      court,
      match: `${currentMatch.teamA} vs ${currentMatch.teamB}`,
      score: currentMatch.score,
      state: currentMatch.submitted ? 'Final' : currentMatch.status.includes('Queued') ? 'Next' : 'Live',
      scorekeeper: currentMatch.scorekeeper
    }
  })
}

function getNextScheduledMatch(court: string, matches: LiveMatch[], updatedAt: string): LiveMatch | null {
  const existingScheduleIndexes = new Set(matches.map((match) => match.scheduleIndex))
  const nextScheduleIndex = badmintonDemoSchedule.findIndex((schedule, index) => schedule.court === court && !existingScheduleIndexes.has(index))

  if (nextScheduleIndex === -1) return null

  const schedule = badmintonDemoSchedule[nextScheduleIndex]
  const [teamA = 'TBD', teamB = 'TBD'] = schedule.match.split(' vs ')

  return {
    id: `match-${nextScheduleIndex + 1}`,
    scheduleIndex: nextScheduleIndex,
    court: schedule.court,
    time: schedule.time,
    division: schedule.division,
    round: schedule.phase,
    teamA,
    teamB,
    teamAScore: 0,
    teamBScore: 0,
    score: `Scheduled ${schedule.time}`,
    status: 'Queued',
    scorekeeper: 'Unassigned',
    editableBy: 'Not started',
    submitted: false,
    completed: false,
    lastUpdatedAt: updatedAt
  }
}

function parseLiveScore(score: string) {
  const currentGame = score.split(',').at(-1)?.trim() ?? score
  const [teamAScore, teamBScore] = currentGame
    .split('-')
    .map((value) => Number.parseInt(value.trim(), 10))

  return {
    teamAScore: Number.isFinite(teamAScore) ? teamAScore : 0,
    teamBScore: Number.isFinite(teamBScore) ? teamBScore : 0
  }
}

function formatLiveScore(score: string, teamAScore: number, teamBScore: number) {
  const priorGames = score.includes(',') ? `${score.split(',').slice(0, -1).join(',')}, ` : ''
  return `${priorGames}${teamAScore}-${teamBScore}`
}
