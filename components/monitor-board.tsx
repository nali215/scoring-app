'use client'
import type {CSSProperties} from 'react'
import {useEvent} from '@/lib/use-event'
import {teamName,formatTime,playerName,matchScore,eventCourts,formatDate,matchDate,chronologicalMatches,matchRuleDescription} from '@/lib/event-types'
import {serviceFor} from '@/lib/event-service'
export function MonitorBoard(){
 const {state,error,loading,lastSync}=useEvent()
 if(!state)return <main className="monitor-empty"><h1>URC Games Pickleball</h1><p>{loading?'Loading courts…':error||'The schedule will appear when the organizer publishes the event.'}</p></main>
 const courts=eventCourts(state),columns=courts.length<=3?courts.length:courts.length===4?2:courts.length<=6?3:4
 const gridStyle={'--court-count':courts.length,'--court-columns':columns,'--court-rows':Math.ceil(courts.length/columns)} as CSSProperties
 return <main className={`monitor-board ${courts.length>3?'monitor-many':''}`} style={gridStyle}><header className="monitor-header"><div><span>URC SOUTHWEST</span><h1>Pickleball · Court scores</h1></div><div><strong>{state.matches.filter(m=>m.status==='Final').length} / {state.matches.length}</strong><span>matches complete</span></div></header>
 <section className="monitor-courts">{courts.map(court=>{
 const all=chronologicalMatches(state,state.matches.filter(m=>m.court===court)),active=all.find(m=>m.status==='Live'||m.status==='Awaiting confirmation'),next=all.find(m=>m.status==='Scheduled'),match=active??next??all.at(-1)
 if(!match)return <article key={court} className="monitor-court"><div className="monitor-court-title"><h2>Court {court}</h2></div><div className="monitor-service"><strong>Available court</strong><span>Select any ready match</span></div></article>
 const g=match.games.at(-1)
 const service=active&&g&&!g.winnerSide?serviceFor(state,match):null
 return <article key={court} className={`monitor-court ${match.division}`}><div className="monitor-court-title"><h2>Court {court}</h2><span>{active?(match.status==='Awaiting confirmation'?'Confirming result':'IN PLAY'):next?'UP NEXT':'COMPLETE'}</span></div><div className="monitor-match-meta"><strong>Match #{match.number} · {match.pool?`Pool ${match.pool} · Round ${match.poolRound}`:match.round}</strong><span>{active?`Game ${match.games.length}`:next?`${formatDate(matchDate(state,match))} · ${formatTime(match.time)}`:'Final result'}</span></div><div className="monitor-teams">{(['A','B']as const).map(side=><div key={side} className={service?.serving===side?'has-serve':''}><span>{teamName(state,side==='A'?match.a:match.b)}</span><strong>{g?(side==='A'?g.teamAScore:g.teamBScore):'–'}</strong></div>)}</div><div className="monitor-service">{service?<><small>SERVING</small><strong>{playerName(state,match,service.serving,service.server)}</strong><span>{service.court} court{service.serverNumber?` · Server ${service.serverNumber}`:''}</span></>:<strong>{g?.winnerSide?'Game complete':next?'Waiting to start':'All matches complete'}</strong>}</div><footer><span>{g?`Games: ${matchScore(match)}`:matchRuleDescription(state,match)}</span>{active&&next&&<small>Next #{next.number}: {teamName(state,next.a)} vs {teamName(state,next.b)}</small>}</footer></article>
 })}</section><footer className="monitor-footer"><span>{error?'CONNECTION LOST · Scores may be out of date':`Updated ${lastSync}`}</span><span>{state.settings.venue||'URC Southwest'} · November 28–29, 2026</span></footer></main>
}
