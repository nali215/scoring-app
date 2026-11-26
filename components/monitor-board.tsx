'use client'
import {useEvent} from '@/lib/use-event'
import {teamName,formatTime,playerName,matchScore} from '@/lib/event-types'
import {doublesService} from '@/lib/doubles-service'
export function MonitorBoard(){
 const {state,error,loading,lastSync}=useEvent()
 if(!state)return <main className="monitor-empty"><h1>URC Southwest Badminton</h1><p>{loading?'Loading courts…':error||'The schedule will appear when the organizer publishes the event.'}</p></main>
 return <main className="monitor-board"><header className="monitor-header"><div><span>URC SOUTHWEST</span><h1>Badminton · Court scores</h1></div><div><strong>{state.matches.filter(m=>m.status==='Final').length} / {state.matches.length}</strong><span>matches complete</span></div></header>
 <section className="monitor-courts">{[1,2,3].map(court=>{
 const all=state.matches.filter(m=>m.court===court),active=all.find(m=>m.status==='Live'||m.status==='Awaiting confirmation'),next=all.find(m=>m.status==='Scheduled'),match=active??next??all.at(-1)!,g=match.games.at(-1)
 const service=active&&g&&!g.winnerSide?doublesService(match.starts[match.games.length-1],match.rallies[match.games.length-1]):null
 return <article key={court} className={`monitor-court ${match.division}`}><div className="monitor-court-title"><h2>Court {court}</h2><span>{active?(match.status==='Awaiting confirmation'?'Confirming result':'IN PLAY'):next?'UP NEXT':'COMPLETE'}</span></div><div className="monitor-match-meta"><strong>Match #{match.number} · {match.round}</strong><span>{active?`Game ${match.games.length}`:next?formatTime(match.time):'Final result'}</span></div><div className="monitor-teams">{(['A','B']as const).map(side=><div key={side} className={service?.serving===side?'has-serve':''}><span>{teamName(state,side==='A'?match.a:match.b)}</span><strong>{g?(side==='A'?g.teamAScore:g.teamBScore):'–'}</strong></div>)}</div><div className="monitor-service">{service?<><small>SERVING</small><strong>{playerName(state,match,service.serving,service.server)}</strong><span>{service.court} service court</span></>:<strong>{g?.winnerSide?'Game complete':next?'Waiting to start':'All matches complete'}</strong>}</div><footer><span>{g?`Games: ${matchScore(match)}`:'One game to 21 · knockouts best of 3'}</span>{active&&next&&<small>Next #{next.number}: {teamName(state,next.a)} vs {teamName(state,next.b)}</small>}</footer></article>
 })}</section><footer className="monitor-footer"><span>{error?'CONNECTION LOST · Scores may be out of date':`Updated ${lastSync}`}</span><span>{state.settings.venue||'URC Southwest'} · November 26, 2026</span></footer></main>
}
