export type RosterFieldKey =
  | 'ignore'
  | 'division'
  | 'teamName'
  | 'seed'
  | 'p1First'
  | 'p1Last'
  | 'p1Email'
  | 'p1Phone'
  | 'p2First'
  | 'p2Last'
  | 'p2Email'
  | 'p2Phone'

export const rosterFields: { key: RosterFieldKey; label: string }[] = [
  { key: 'ignore', label: 'Ignore column' },
  { key: 'division', label: 'Division' },
  { key: 'teamName', label: 'Team name' },
  { key: 'seed', label: 'Seed' },
  { key: 'p1First', label: 'Player 1 first name' },
  { key: 'p1Last', label: 'Player 1 last name' },
  { key: 'p1Email', label: 'Player 1 email' },
  { key: 'p1Phone', label: 'Player 1 phone' },
  { key: 'p2First', label: 'Player 2 first name' },
  { key: 'p2Last', label: 'Player 2 last name' },
  { key: 'p2Email', label: 'Player 2 email' },
  { key: 'p2Phone', label: 'Player 2 phone' }
]

export type DraftPlayer = {
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

export type DraftTeam = {
  rowNumber: number
  division: string
  name: string
  seed?: number
  players: DraftPlayer[]
}

export type RosterPlayer = {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

export type RosterTeam = {
  id: string
  division: string
  name: string
  seed?: number
  players: RosterPlayer[]
  createdAt: string
  updatedAt: string
}

export type Roster = {
  version: number
  updatedAt: string
  teams: RosterTeam[]
}

export type ColumnMapping = Record<number, RosterFieldKey>

export type DraftBuildResult = {
  drafts: DraftTeam[]
  errors: { rowNumber: number; message: string }[]
}

export type MergeResult = {
  rowNumber: number
  division: string
  name: string
  status: 'added' | 'updated'
}

export function createEmptyRoster(): Roster {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    teams: []
  }
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function autoMapHeaders(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  let firstNameSeen = 0
  let lastNameSeen = 0
  let emailSeen = 0

  headers.forEach((header, index) => {
    const value = normalizeHeader(header)
    let field: RosterFieldKey = 'ignore'

    if (!value || value === 'timestamp') {
      mapping[index] = 'ignore'
      return
    }

    const hasTwo = /2|two|second|partner|b\b/.test(value)

    if (value.includes('division') || value.includes('category') || value.includes('event') || value.includes('bracket')) {
      field = 'division'
    } else if (value.includes('team') && value.includes('name')) {
      field = 'teamName'
    } else if (value.includes('seed') || value.includes('rank')) {
      field = 'seed'
    } else if (value.includes('phone') || value.includes('mobile') || value.includes('cell')) {
      field = hasTwo ? 'p2Phone' : 'p1Phone'
    } else if (value.includes('email')) {
      field = emailSeen === 0 && !hasTwo ? 'p1Email' : 'p2Email'
      emailSeen += 1
    } else if (value.includes('first')) {
      const useSecond = hasTwo || firstNameSeen > 0
      field = useSecond ? 'p2First' : 'p1First'
      firstNameSeen += 1
    } else if (value.includes('last') || value.includes('surname')) {
      const useSecond = hasTwo || lastNameSeen > 0
      field = useSecond ? 'p2Last' : 'p1Last'
      lastNameSeen += 1
    } else if (value.includes('partner')) {
      field = 'p2First'
    } else if (value === 'name' || value.includes('playername') || value.includes('fullname') || value.includes('yourname')) {
      field = firstNameSeen > 0 || hasTwo ? 'p2First' : 'p1First'
      firstNameSeen += 1
    }

    mapping[index] = field
  })

  return mapping
}

function readCell(row: string[], index: number | undefined): string {
  if (index === undefined || index < 0) return ''
  const value = row[index]
  return value === undefined || value === null ? '' : String(value).trim()
}

function findColumn(mapping: ColumnMapping, field: RosterFieldKey): number | undefined {
  const entry = Object.entries(mapping).find(([, value]) => value === field)
  return entry ? Number(entry[0]) : undefined
}

function splitFullName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length <= 1) return { firstName: full.trim(), lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export function buildDraftTeams(rows: string[][], mapping: ColumnMapping): DraftBuildResult {
  const cols = {
    division: findColumn(mapping, 'division'),
    teamName: findColumn(mapping, 'teamName'),
    seed: findColumn(mapping, 'seed'),
    p1First: findColumn(mapping, 'p1First'),
    p1Last: findColumn(mapping, 'p1Last'),
    p1Email: findColumn(mapping, 'p1Email'),
    p1Phone: findColumn(mapping, 'p1Phone'),
    p2First: findColumn(mapping, 'p2First'),
    p2Last: findColumn(mapping, 'p2Last'),
    p2Email: findColumn(mapping, 'p2Email'),
    p2Phone: findColumn(mapping, 'p2Phone')
  }

  const drafts: DraftTeam[] = []
  const errors: { rowNumber: number; message: string }[] = []

  rows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 2
    const isEmpty = row.every((cell) => String(cell ?? '').trim() === '')
    if (isEmpty) return

    const division = readCell(row, cols.division)

    let p1First = readCell(row, cols.p1First)
    let p1Last = readCell(row, cols.p1Last)
    if (p1First && !p1Last && cols.p1Last === undefined) {
      const split = splitFullName(p1First)
      p1First = split.firstName
      p1Last = split.lastName
    }

    let p2First = readCell(row, cols.p2First)
    let p2Last = readCell(row, cols.p2Last)
    if (p2First && !p2Last && cols.p2Last === undefined) {
      const split = splitFullName(p2First)
      p2First = split.firstName
      p2Last = split.lastName
    }

    if (!division) {
      errors.push({ rowNumber, message: 'Missing division' })
      return
    }
    if (!p1First) {
      errors.push({ rowNumber, message: 'Missing player name' })
      return
    }

    const players: DraftPlayer[] = [
      {
        firstName: p1First,
        lastName: p1Last,
        email: readCell(row, cols.p1Email) || undefined,
        phone: readCell(row, cols.p1Phone) || undefined
      }
    ]

    if (p2First) {
      players.push({
        firstName: p2First,
        lastName: p2Last,
        email: readCell(row, cols.p2Email) || undefined,
        phone: readCell(row, cols.p2Phone) || undefined
      })
    }

    const explicitName = readCell(row, cols.teamName)
    const name = explicitName || deriveTeamName(players)

    const seedRaw = readCell(row, cols.seed)
    const seedValue = Number.parseInt(seedRaw, 10)

    drafts.push({
      rowNumber,
      division,
      name,
      seed: Number.isFinite(seedValue) ? seedValue : undefined,
      players
    })
  })

  return { drafts, errors }
}

function deriveTeamName(players: DraftPlayer[]): string {
  if (players.length >= 2) {
    return players.map((player) => player.lastName || player.firstName).join(' / ')
  }
  const player = players[0]
  return [player.firstName, player.lastName].filter(Boolean).join(' ')
}

function teamKey(division: string, name: string): string {
  return `${division.trim().toLowerCase()}::${name.trim().toLowerCase()}`
}

function playerKey(player: { firstName: string; lastName: string; email?: string }): string {
  if (player.email) return `email:${player.email.trim().toLowerCase()}`
  return `name:${player.firstName.trim().toLowerCase()}|${player.lastName.trim().toLowerCase()}`
}

export function mergeRoster(
  existing: Roster,
  drafts: DraftTeam[],
  options: { now: string; nextId: () => string }
): { roster: Roster; results: MergeResult[] } {
  const teams = existing.teams.map((team) => ({ ...team, players: team.players.map((player) => ({ ...player })) }))
  const indexByKey = new Map<string, number>()
  teams.forEach((team, index) => indexByKey.set(teamKey(team.division, team.name), index))

  const results: MergeResult[] = []

  for (const draft of drafts) {
    const key = teamKey(draft.division, draft.name)
    const existingIndex = indexByKey.get(key)

    if (existingIndex === undefined) {
      const team: RosterTeam = {
        id: options.nextId(),
        division: draft.division,
        name: draft.name,
        seed: draft.seed,
        players: draft.players.map((player) => ({ id: options.nextId(), ...player })),
        createdAt: options.now,
        updatedAt: options.now
      }
      teams.push(team)
      indexByKey.set(key, teams.length - 1)
      results.push({ rowNumber: draft.rowNumber, division: draft.division, name: draft.name, status: 'added' })
    } else {
      const team = teams[existingIndex]
      const byKey = new Map<string, RosterPlayer>()
      team.players.forEach((player) => byKey.set(playerKey(player), player))

      team.players = draft.players.map((player) => {
        const match = byKey.get(playerKey(player))
        if (match) {
          return { ...match, ...player }
        }
        return { id: options.nextId(), ...player }
      })

      if (draft.seed !== undefined) team.seed = draft.seed
      team.updatedAt = options.now
      results.push({ rowNumber: draft.rowNumber, division: draft.division, name: draft.name, status: 'updated' })
    }
  }

  return {
    roster: {
      version: existing.version + 1,
      updatedAt: options.now,
      teams
    },
    results
  }
}

export function previewMerge(existing: Roster, drafts: DraftTeam[]): MergeResult[] {
  return mergeRoster(existing, drafts, { now: '', nextId: () => 'preview' }).results
}

export function rosterSummary(roster: Roster): { teams: number; players: number; divisions: number } {
  const divisions = new Set(roster.teams.map((team) => team.division))
  const players = roster.teams.reduce((total, team) => total + team.players.length, 0)
  return { teams: roster.teams.length, players, divisions: divisions.size }
}
