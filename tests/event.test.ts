import { describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { createEvent } from '@/lib/event-seed'
import { actionSchema, applyEventAction, scheduleConflicts, publicView } from '@/lib/event-engine'
import { divisions, standings, type EventState } from '@/lib/event-types'
import source from '@/data/urc-2026.json'

function ready() { const s=createEvent();s.published=true;s.settings.venue='Test venue';s.settings.reviewed=true;s.courtSessions={'1':'test-court-one','2':'test-court-two','3':'test-court-three'};return s }
function action(s:EventState, body:Record<string,unknown>, court?:number) {
  const match=typeof body.match==='number'?s.matches.find(m=>m.number===body.match):null
  return applyEventAction(s, actionSchema.parse({requestId:randomUUID(),version:match?.version??s.version,...body}), court?{admin:false,court,session:s.courtSessions[String(court)]}:{admin:true})
}
function finish(s:EventState,n:number,side='A') {
  action(s,{action:'start',coinTossWinner:'A',match:n})
  const m=s.matches.find(m=>m.number===n)!
  while(m.status==='Live'){if(m.games.at(-1)?.winnerSide)action(s,{action:'nextGame',match:n});else action(s,{action:'point',match:n,side})}
  action(s,{action:'submit',match:n})
}
describe('URC source import',()=>{
  it('preserves all 53 master-schedule assignments and correct team counts',()=>{
    const s=createEvent()
    expect(s.matches).toHaveLength(53)
    expect(divisions.map(d=>s.teams.filter(t=>t.division===d).length)).toEqual([9,8,4])
    for(const row of source){const m=s.matches.find(m=>m.number===row.number)!;expect([m.court,m.time]).toEqual([row.court,row.time])}
    expect([39,40,41].map(n=>s.matches[n-1].court)).toEqual([1,2,3])
    expect(scheduleConflicts(s)).toEqual([])
    for(const t of s.teams)expect(s.matches.filter(m=>m.a.team===t.id||m.b.team===t.id)).toHaveLength(t.division==='men'?4:3)
  })
  it('keeps different Sohils separate and shared players consistent across divisions',()=>{
    const s=createEvent()
    expect(s.teams.find(t=>t.id==='men-1')!.players).toContain('sohil.m')
    expect(s.teams.find(t=>t.id==='men-8')!.players).toContain('sohil.p')
    expect(s.teams.find(t=>t.id==='mixed-2')!.players).toContain('sohil.p')
  })
})
describe('scoring safety',()=>{
  it('denies missing, revoked and cross-court credentials',()=>{
    const s=ready(),a=actionSchema.parse({action:'start',coinTossWinner:'A',match:1,version:0,requestId:randomUUID()})
    expect(()=>applyEventAction(s,a,{admin:false,court:1,session:'wrong'})).toThrow('session ended')
    expect(()=>applyEventAction(s,a,{admin:false,court:2,session:s.courtSessions['2']})).toThrow('assigned court')
    const old=s.courtSessions['1']
    applyEventAction(s,actionSchema.parse({action:'releaseScorer',court:1,version:s.version,requestId:randomUUID()}),{admin:true})
    expect(()=>applyEventAction(s,a,{admin:false,court:1,session:old})).toThrow('session ended')
  })
  it('rejects forged actions, stale versions, premature finals and global resets',()=>{
    const s=ready();expect(actionSchema.safeParse({action:'reset'}).success).toBe(false)
    action(s,{action:'start',coinTossWinner:'A',match:1})
    expect(()=>action(s,{action:'submit',match:1})).toThrow('Finish')
    expect(()=>action(s,{action:'point',match:1,side:'A',version:0})).toThrow('changed')
    const requestId=randomUUID(),version=s.matches[0].version
    action(s,{action:'point',match:1,side:'A',version,requestId})
    action(s,{action:'point',match:1,side:'A',version,requestId})
    expect(s.matches[0].games[0].teamAScore).toBe(1)
  })
  it('undoes the final rally and advances best-of-three games correctly',()=>{
    const s=ready();action(s,{action:'start',coinTossWinner:'A',match:1})
    for(let i=0;i<21;i++)action(s,{action:'point',match:1,side:'A'})
    expect(s.matches[0].status).toBe('Awaiting confirmation')
    action(s,{action:'removePoint',match:1,side:'A'});expect(s.matches[0].games[0].teamAScore).toBe(20)
    expect(s.matches[0].status).toBe('Live')
    action(s,{action:'point',match:1,side:'A'});action(s,{action:'submit',match:1})
    expect(standings(s,'men').find(r=>r.team.id===s.matches[0].a.team)?.wins).toBe(1)
    expect(()=>action(s,{action:'point',match:1,side:'B'})).toThrow('not accepting')
  })
  it('blocks a shared player from starting simultaneously on another court',()=>{
    const s=ready();action(s,{action:'start',coinTossWinner:'A',match:2})
    expect(()=>action(s,{action:'start',coinTossWinner:'A',match:7})).toThrow('another court')
  })
  it('does not expose keys, audit or point history publicly',()=>{
    const s=ready();action(s,{action:'start',coinTossWinner:'A',match:1});action(s,{action:'point',match:1,side:'A'})
    const view=publicView(s)
    expect(view).not.toHaveProperty('courtSessions');expect(view).not.toHaveProperty('audit');expect(view.matches[0].history).toEqual([])
  })
})
describe('complete tournament rehearsal',()=>{
  it('runs all 53 matches through rankings, advancement, and consecutive finals',()=>{
    const s=ready()
    expect(()=>action(s,{action:'seed',division:'men',order:s.teams.filter(t=>t.division==='men').map(t=>t.id)})).toThrow('Complete all')
    for(let n=1;n<=36;n++)finish(s,n)
    for(const d of divisions)action(s,{action:'seed',division:d,order:standings(s,d).map(r=>r.team.id)})
    expect(s.matches[36].a.team).toBe(s.seeds.men![0]);expect(s.matches[36].b.team).toBe(s.seeds.men![7])
    for(let n=37;n<=50;n++)finish(s,n)
    expect(()=>action(s,{action:'start',coinTossWinner:'A',match:52})).toThrow('earlier final')
    for(let n=51;n<=53;n++)finish(s,n)
    expect(s.matches.filter(m=>m.status==='Final')).toHaveLength(53)
    expect(s.matches.slice(36).every(m=>m.games.length===2)).toBe(true)
    expect(s.matches[51].a.team).toBe(s.matches[45].winner)
    expect(()=>action(s,{action:'reopen',match:37,reason:'Correct score entry'})).toThrow('dependent')
    expect(()=>action(s,{action:'clearSeeds',division:'men'})).toThrow('locked')
  })
  it('clears downstream assignments when reopening an unconsumed playoff result',()=>{
    const s=ready();for(let n=1;n<=36;n++)finish(s,n)
    action(s,{action:'seed',division:'men',order:standings(s,'men').map(r=>r.team.id)})
    finish(s,37);expect(s.matches[45].a.team).toBeTruthy()
    action(s,{action:'reopen',match:37,reason:'Incorrect final rally'})
    expect(s.matches[45].a.team).toBeUndefined()
    action(s,{action:'removePoint',match:37,side:'A'});expect(s.matches[36].status).toBe('Live')
  })
})
