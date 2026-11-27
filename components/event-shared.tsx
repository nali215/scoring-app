'use client'
import Link from 'next/link'
import type { Division, EventView, Match } from '@/lib/event-types'
import { divisionNames, formatDate, matchDate, formatDescription, formatTime, matchScore, teamName } from '@/lib/event-types'

export function DivisionBadge({ division }: { division: Division }) { return <span className={`division ${division}`}>{divisionNames[division]}</span> }
export function MatchCard({ state, match, action }: { state: EventView; match: Match; action?: React.ReactNode }) {
  return <article className={`match-card ${match.status === 'Live' ? 'is-live' : ''}`}>
    <div className="row-between"><Link className="muted match-detail-link" href={`/matches/${match.number}`}>#{String(match.number).padStart(2, '0')} · {formatDate(matchDate(state,match))} · Court {match.court} · Details</Link><span className={`match-status ${match.status === 'Live' ? 'live' : ''}`}>{match.status}</span></div>
    <Link href={`/matches/${match.number}`} className="match-names"><span className={match.winner === match.a.team ? 'winner' : ''}>{teamName(state, match.a)}</span><span className="versus">vs</span><span className={match.winner === match.b.team ? 'winner' : ''}>{teamName(state, match.b)}</span></Link>
    <div className="row-between"><DivisionBadge division={match.division}/><strong className="tabular">{match.games.length ? matchScore(match) : formatTime(match.time)}</strong></div>
    <p className="helper">{formatDescription(match)} · win by {state.settings.winBy}</p>
    {action ? <div className="match-action">{action}</div> : null}
  </article>
}
export function Notice({ children, error = false }: { children: React.ReactNode; error?: boolean }) { return <div className={`notice ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>{children}</div> }
export function Loading() { return <div className="empty-panel" role="status"><span className="loading-line"/><h2>Loading tournament…</h2><p>Getting the latest schedule and results.</p></div> }
