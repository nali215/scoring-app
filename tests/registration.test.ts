import { describe, expect, it } from 'vitest'
import {
  autoMapRegistrationColumns,
  buildRegistrationTeams,
  looksLikeRegistration,
  toRegistrationMapping
} from '@/lib/registration'

// Mirrors the real Google Form export (email collection ON, gender-split sections).
const headers = [
  'Timestamp',
  'Email Address',
  'Name',
  'Date of Birth',
  'Gender',
  'Playing Categories (W)',
  '18+ AGE GROUP ONLY: Are you available to play on Friday, JULY 24th?',
  'T-shirt Size (for women)',
  "Doubles Partner's Full Name",
  'Phone Number ',
  'Playing Categories (M)',
  '18+ AGE GROUP ONLY: Are you available to play on Friday JULY 24th?',
  'T-shirt Size (for men)',
  "Your Doubles Partner's Full Name",
  'Your Phone Number '
]

function maleRow(email: string, name: string, categories: string, partner: string, phone: string): string[] {
  return ['ts', email, name, '01/01/1990', 'Male', '', '', '', '', '', categories, 'Yes', 'Adult Large', partner, phone]
}

function femaleRow(email: string, name: string, categories: string, partner: string, phone: string): string[] {
  return ['ts', email, name, '01/01/1990', 'Female', categories, 'Yes', 'Adult Small', partner, phone, '', '', '', '', '']
}

describe('registration auto-mapping', () => {
  it('detects a registration export and maps gender-split columns', () => {
    expect(looksLikeRegistration(headers)).toBe(true)

    const mapping = toRegistrationMapping(autoMapRegistrationColumns(headers))
    expect(mapping.email).toBe(1)
    expect(mapping.name).toBe(2)
    expect(mapping.gender).toBe(4)
    expect(mapping.categories).toEqual([5, 10])
    expect(mapping.partners).toEqual([8, 13])
    expect(mapping.phones).toEqual([9, 14])
  })

  it('does not misclassify a plain team list as registration', () => {
    expect(looksLikeRegistration(['Division', 'Team Name', 'Player 1 First Name', 'Seed'])).toBe(false)
  })
})

describe('buildRegistrationTeams', () => {
  const mapping = toRegistrationMapping(autoMapRegistrationColumns(headers))

  it('reconciles mutual doubles registrations into one team and splits multi-select categories', () => {
    const rows = [
      maleRow('naveed@x.com', 'Naveed Ali', "18+ Men's Doubles, 18+ Men's Singles", 'Sam Park', '111'),
      maleRow('sam@x.com', 'Sam Park', "18+ Men's Doubles", 'Naveed Ali', '222'),
      femaleRow('alice@x.com', 'Alice Lee', "18+ Women's Singles", '', '333')
    ]

    const { drafts, errors } = buildRegistrationTeams(rows, mapping)
    expect(errors).toEqual([])

    const doubles = drafts.find((d) => d.division === "18+ Men's Doubles")
    expect(doubles).toBeDefined()
    expect(doubles?.name).toBe('Ali / Park')
    expect(doubles?.players).toHaveLength(2)
    expect(doubles?.players.map((p) => p.email).sort()).toEqual(['naveed@x.com', 'sam@x.com'])

    const singles = drafts.find((d) => d.division === "18+ Men's Singles")
    expect(singles?.players).toHaveLength(1)
    expect(singles?.name).toBe('Naveed Ali')

    const womens = drafts.find((d) => d.division === "18+ Women's Singles")
    expect(womens?.players).toHaveLength(1)
    expect(womens?.players[0].email).toBe('alice@x.com')

    // Men's Doubles (deduped) + Men's Singles + Women's Singles = 3 teams total
    expect(drafts).toHaveLength(3)
  })

  it('creates a one-player doubles team when the partner did not register', () => {
    const rows = [femaleRow('bev@x.com', 'Bev Rao', "18+ Women's Doubles", 'Kim Singh', '444')]
    const { drafts } = buildRegistrationTeams(rows, mapping)

    const team = drafts.find((d) => d.division === "18+ Women's Doubles")
    expect(team?.players).toHaveLength(2)
    expect(team?.name).toBe('Rao / Singh')
    expect(team?.players.find((p) => p.email === 'bev@x.com')).toBeDefined()
  })

  it('flags rows with no category selected', () => {
    const rows = [maleRow('x@x.com', 'No Category', '', 'Someone', '555')]
    const { drafts, errors } = buildRegistrationTeams(rows, mapping)
    expect(drafts).toHaveLength(0)
    expect(errors[0].message).toBe('No category selected')
  })
})
