import { describe, expect, it } from 'vitest'
import {
  autoMapHeaders,
  buildDraftTeams,
  createEmptyRoster,
  mergeRoster,
  previewMerge,
  rosterSummary
} from '@/lib/roster'

let counter = 0
const testOptions = () => ({ now: '2026-01-01T00:00:00.000Z', nextId: () => `id-${(counter += 1)}` })

describe('autoMapHeaders', () => {
  it('maps Google Forms style headers', () => {
    const headers = [
      'Timestamp',
      'Division',
      'Player 1 First Name',
      'Player 1 Last Name',
      'Partner First Name',
      'Partner Last Name',
      'Email Address'
    ]

    const mapping = autoMapHeaders(headers)

    expect(mapping[0]).toBe('ignore')
    expect(mapping[1]).toBe('division')
    expect(mapping[2]).toBe('p1First')
    expect(mapping[3]).toBe('p1Last')
    expect(mapping[4]).toBe('p2First')
    expect(mapping[5]).toBe('p2Last')
    expect(mapping[6]).toBe('p1Email')
  })
})

describe('buildDraftTeams', () => {
  it('derives doubles team names and reports missing fields', () => {
    const mapping = autoMapHeaders(['Division', 'Player 1 First Name', 'Player 1 Last Name', 'Partner First Name', 'Partner Last Name'])
    const { drafts, errors } = buildDraftTeams(
      [
        ['Mixed Doubles', 'Maya', 'Rahman', 'Noah', 'Ali'],
        ['', 'Solo', 'Player', '', ''],
        ['Men\u2019s Singles', 'Omar', 'Khan', '', '']
      ],
      mapping
    )

    expect(drafts).toHaveLength(2)
    expect(drafts[0].name).toBe('Rahman / Ali')
    expect(drafts[0].players).toHaveLength(2)
    expect(drafts[1].name).toBe('Omar Khan')
    expect(errors).toEqual([{ rowNumber: 3, message: 'Missing division' }])
  })

  it('splits a single full-name column when no last-name column is mapped', () => {
    const mapping = autoMapHeaders(['Division', 'Player Name'])
    const { drafts } = buildDraftTeams([['Men\u2019s Singles', 'Omar Khan']], mapping)

    expect(drafts[0].players[0]).toMatchObject({ firstName: 'Omar', lastName: 'Khan' })
  })
})

describe('mergeRoster', () => {
  it('adds new teams and updates existing teams by division and name', () => {
    const mapping = autoMapHeaders(['Division', 'Player 1 First Name', 'Player 1 Last Name', 'Email Address', 'Seed'])

    const first = buildDraftTeams([['Men\u2019s Singles', 'Omar', 'Khan', 'omar@example.com', '2']], mapping)
    const created = mergeRoster(createEmptyRoster(), first.drafts, testOptions())

    expect(created.results[0].status).toBe('added')
    expect(created.roster.teams).toHaveLength(1)
    expect(created.roster.teams[0].seed).toBe(2)

    const second = buildDraftTeams([['Men\u2019s Singles', 'Omar', 'Khan', 'omar@example.com', '1']], mapping)
    const updated = mergeRoster(created.roster, second.drafts, testOptions())

    expect(updated.results[0].status).toBe('updated')
    expect(updated.roster.teams).toHaveLength(1)
    expect(updated.roster.teams[0].seed).toBe(1)
    expect(updated.roster.teams[0].players[0].id).toBe(created.roster.teams[0].players[0].id)
  })

  it('previewMerge reports status without mutating the roster', () => {
    const roster = createEmptyRoster()
    const mapping = autoMapHeaders(['Division', 'Player 1 First Name', 'Player 1 Last Name'])
    const { drafts } = buildDraftTeams([['Mixed', 'Ann', 'Lee']], mapping)

    const preview = previewMerge(roster, drafts)

    expect(preview[0].status).toBe('added')
    expect(roster.teams).toHaveLength(0)
  })
})

describe('rosterSummary', () => {
  it('counts teams, players, and divisions', () => {
    const mapping = autoMapHeaders(['Division', 'Player 1 First Name', 'Player 1 Last Name', 'Partner First Name', 'Partner Last Name'])
    const { drafts } = buildDraftTeams(
      [
        ['Mixed', 'Ann', 'Lee', 'Bob', 'Kim'],
        ['Men\u2019s Singles', 'Omar', 'Khan', '', '']
      ],
      mapping
    )
    const { roster } = mergeRoster(createEmptyRoster(), drafts, testOptions())

    expect(rosterSummary(roster)).toEqual({ teams: 2, players: 3, divisions: 2 })
  })
})
