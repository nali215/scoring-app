import type { MatchRow, ScheduleRow, StandingRow } from '@/lib/app-data'

export type LiveMatch = MatchRow & {
  id: string
  scheduleIndex: number
  teamAScore: number
  teamBScore: number
  scorekeeper: string
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

export type LiveState = {
  version: number
  updatedAt: string
  matches: LiveMatch[]
  courts: LiveCourt[]
  standings: StandingRow[]
  schedule: ScheduleRow[]
}

type LiveAction =
  | { action: 'awardPoint'; matchId: string; side: 'A' | 'B' }
  | { action: 'submitMatch'; matchId: string }
  | { action: 'reopenMatch'; matchId: string }
  | { action: 'reset' }

declare global {
  var scoringLiveState: LiveState | undefined
}

export function getLiveState(): LiveState {
  if (!globalThis.scoringLiveState) {
    globalThis.scoringLiveState = createEmptyLiveState()
  }

  return globalThis.scoringLiveState
}

export function applyLiveAction(action: LiveAction): LiveState {
  if (action.action === 'reset') {
    globalThis.scoringLiveState = createEmptyLiveState()
    return globalThis.scoringLiveState
  }

  const state = getLiveState()
  const matchIndex = state.matches.findIndex((match) => match.id === action.matchId)

  if (matchIndex === -1) {
    throw new Error('Match not found')
  }

  const match = state.matches[matchIndex]

  if (match.submitted && action.action !== 'reopenMatch') {
    throw new Error('Submitted matches are locked. Only admin correction can edit them.')
  }

  const now = new Date().toISOString()
  const matches = [...state.matches]
  matches[matchIndex] = applyMatchAction(match, action, now)

  globalThis.scoringLiveState = {
    ...state,
    version: state.version + 1,
    updatedAt: now,
    matches,
    courts: buildCourts(matches)
  }

  return globalThis.scoringLiveState
}

function createEmptyLiveState(): LiveState {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    matches: [],
    courts: [],
    standings: [],
    schedule: []
  }
}

function applyMatchAction(match: LiveMatch, action: LiveAction, updatedAt: string): LiveMatch {
  if (action.action === 'awardPoint') {
    const teamAScore = action.side === 'A' ? match.teamAScore + 1 : match.teamAScore
    const teamBScore = action.side === 'B' ? match.teamBScore + 1 : match.teamBScore

    return {
      ...match,
      teamAScore,
      teamBScore,
      score: `${teamAScore}-${teamBScore}`,
      status: 'Live',
      editableBy: 'Scorekeeper while live',
      lastUpdatedAt: updatedAt
    }
  }

  if (action.action === 'submitMatch') {
    return {
      ...match,
      status: 'Final',
      submitted: true,
      completed: true,
      editableBy: 'Admin only',
      lastUpdatedAt: updatedAt
    }
  }

  return {
    ...match,
    status: 'Live',
    submitted: false,
    completed: false,
    editableBy: 'Scorekeeper while live',
    lastUpdatedAt: updatedAt
  }
}

function buildCourts(matches: LiveMatch[]): LiveCourt[] {
  const courts = Array.from(new Set(matches.map((match) => match.court))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  return courts.map((court) => {
    const courtMatches = matches.filter((match) => match.court === court).toSorted((a, b) => a.scheduleIndex - b.scheduleIndex)
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
      state: currentMatch.submitted ? 'Final' : currentMatch.status,
      scorekeeper: currentMatch.scorekeeper
    }
  })
}

