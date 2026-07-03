import type { DraftPlayer, DraftTeam } from '@/lib/roster'

export type RegistrationFieldKey = 'ignore' | 'email' | 'name' | 'gender' | 'category' | 'partner' | 'phone'

export const registrationFields: { key: RegistrationFieldKey; label: string }[] = [
  { key: 'ignore', label: 'Ignore column' },
  { key: 'email', label: 'Email' },
  { key: 'name', label: 'Player name' },
  { key: 'gender', label: 'Gender' },
  { key: 'category', label: 'Category / division' },
  { key: 'partner', label: "Partner's name" },
  { key: 'phone', label: 'Phone' }
]

export type RegistrationColumns = Record<number, RegistrationFieldKey>

export type RegistrationMapping = {
  email?: number
  name?: number
  gender?: number
  categories: number[]
  partners: number[]
  phones: number[]
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function autoMapRegistrationColumns(headers: string[]): RegistrationColumns {
  const columns: RegistrationColumns = {}
  let nameTaken = false

  headers.forEach((header, index) => {
    const value = normalizeHeader(header)
    let field: RegistrationFieldKey = 'ignore'

    if (!value || value === 'timestamp') {
      field = 'ignore'
    } else if (value.includes('email')) {
      field = 'email'
    } else if (value.includes('partner')) {
      field = 'partner'
    } else if (value.includes('categor') || value.includes('division') || value.includes('event') || value.includes('bracket')) {
      field = 'category'
    } else if (value.includes('phone') || value.includes('mobile') || value.includes('cell')) {
      field = 'phone'
    } else if (value.includes('gender') || value === 'sex') {
      field = 'gender'
    } else if (!nameTaken && (value === 'name' || value.includes('fullname') || value.includes('playername') || value.includes('name'))) {
      field = 'name'
      nameTaken = true
    }

    columns[index] = field
  })

  return columns
}

export function toRegistrationMapping(columns: RegistrationColumns): RegistrationMapping {
  const mapping: RegistrationMapping = { categories: [], partners: [], phones: [] }

  for (const [key, field] of Object.entries(columns)) {
    const index = Number(key)
    if (field === 'email' && mapping.email === undefined) mapping.email = index
    else if (field === 'name' && mapping.name === undefined) mapping.name = index
    else if (field === 'gender' && mapping.gender === undefined) mapping.gender = index
    else if (field === 'category') mapping.categories.push(index)
    else if (field === 'partner') mapping.partners.push(index)
    else if (field === 'phone') mapping.phones.push(index)
  }

  return mapping
}

export function looksLikeRegistration(headers: string[]): boolean {
  const normalized = headers.map(normalizeHeader)
  const categoryCount = normalized.filter((value) => value.includes('categor') || value.includes('playingcategor')).length
  const partnerCount = normalized.filter((value) => value.includes('partner')).length
  const hasGender = normalized.some((value) => value.includes('gender'))
  return partnerCount >= 1 && (hasGender || categoryCount >= 1)
}

function readCell(row: string[], index: number | undefined): string {
  if (index === undefined || index < 0) return ''
  const value = row[index]
  return value === undefined || value === null ? '' : String(value).trim()
}

function firstNonEmpty(row: string[], indexes: number[]): string {
  for (const index of indexes) {
    const value = readCell(row, index)
    if (value) return value
  }
  return ''
}

function splitFullName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return { firstName: full.trim(), lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function nameKey(full: string): string {
  return full.trim().toLowerCase().replace(/\s+/g, ' ')
}

function lastOrFull(player: DraftPlayer): string {
  return player.lastName || player.firstName
}

type TeamAccumulator = {
  division: string
  rowNumber: number
  isDoubles: boolean
  players: Map<string, DraftPlayer>
}

function upsertPlayer(players: Map<string, DraftPlayer>, full: string, contact: { email?: string; phone?: string }) {
  const key = nameKey(full)
  if (!key) return
  const existing = players.get(key)
  const split = splitFullName(full)

  if (existing) {
    players.set(key, {
      firstName: existing.firstName || split.firstName,
      lastName: existing.lastName || split.lastName,
      email: existing.email ?? (contact.email || undefined),
      phone: existing.phone ?? (contact.phone || undefined)
    })
    return
  }

  players.set(key, {
    firstName: split.firstName,
    lastName: split.lastName,
    email: contact.email || undefined,
    phone: contact.phone || undefined
  })
}

export function buildRegistrationTeams(
  rows: string[][],
  mapping: RegistrationMapping
): { drafts: DraftTeam[]; errors: { rowNumber: number; message: string }[] } {
  const teams = new Map<string, TeamAccumulator>()
  const errors: { rowNumber: number; message: string }[] = []

  rows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 2
    const isEmpty = row.every((cell) => String(cell ?? '').trim() === '')
    if (isEmpty) return

    const name = readCell(row, mapping.name)
    if (!name) {
      errors.push({ rowNumber, message: 'Missing player name' })
      return
    }

    const email = firstNonEmpty(row, mapping.email !== undefined ? [mapping.email] : []) || undefined
    const phone = firstNonEmpty(row, mapping.phones) || undefined
    const partner = firstNonEmpty(row, mapping.partners)

    const categoriesRaw = mapping.categories
      .map((index) => readCell(row, index))
      .filter(Boolean)
      .join(', ')
    const categories = categoriesRaw
      .split(/,\s*/)
      .map((value) => value.trim())
      .filter(Boolean)

    if (categories.length === 0) {
      errors.push({ rowNumber, message: 'No category selected' })
      return
    }

    for (const division of categories) {
      const isDoubles = /doubles/i.test(division)
      const key =
        isDoubles && partner
          ? `${division}||${[nameKey(name), nameKey(partner)].sort().join('&')}`
          : `${division}||${nameKey(name)}`

      let team = teams.get(key)
      if (!team) {
        team = { division, rowNumber, isDoubles, players: new Map() }
        teams.set(key, team)
      }

      upsertPlayer(team.players, name, { email, phone })
      if (isDoubles && partner) {
        upsertPlayer(team.players, partner, {})
      }
    }
  })

  const drafts: DraftTeam[] = Array.from(teams.values()).map((team) => {
    const players = Array.from(team.players.values()).sort(
      (a, b) => lastOrFull(a).toLowerCase().localeCompare(lastOrFull(b).toLowerCase()) || a.firstName.localeCompare(b.firstName)
    )
    const name = players.length >= 2 ? players.map(lastOrFull).join(' / ') : [players[0]?.firstName, players[0]?.lastName].filter(Boolean).join(' ')

    return {
      rowNumber: team.rowNumber,
      division: team.division,
      name,
      players
    }
  })

  drafts.sort((a, b) => a.division.localeCompare(b.division) || a.name.localeCompare(b.name))

  return { drafts, errors }
}
