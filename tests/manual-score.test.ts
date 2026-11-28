import {describe,it,expect} from 'vitest'
import {randomUUID} from 'node:crypto'
import {createPickleballEvent} from '@/lib/pickleball-seed'
import {appendMixedDoubles} from '@/lib/mixed-pickleball'
import {applyEventAction,actionSchema,publicView} from '@/lib/event-engine'
import {serviceFor} from '@/lib/event-service'
import {standings,type EventState} from '@/lib/event-types'
function ready(){const s=createPickleballEvent();s.settings.courtCount=3;s.published=true;return appendMixedDoubles(s,'2026-11-28')}
function act(s:EventState,data:object){const m='match'in data?s.matches.find(m=>m.number===(data as {match:number}).match):null;return applyEventAction(s,actionSchema.parse({requestId:randomUUID(),version:m?.version??s.version,...data}),{admin:true})}
const reason='Official court score sheet'
const service={serving:'B',server:1,receiver:0,court:'left',serverNumber:1,openingServe:false} as const
function final(s:EventState,n:number,a=11,b=5,extra:object={}){return act(s,{action:'manualScore',mode:'final',match:n,games:[{a,b}],reason,...extra})}
describe('admin retrospective score entry',()=>{
 it('records an unstarted past match as final, updates standings and preserves unrelated matches',()=>{
  const s=ready(),before=structuredClone(s.matches[1]);final(s,1)
  const m=s.matches[0];expect(m.status).toBe('Final');expect(m.winner).toBe('junior-1');expect(m.games[0]).toMatchObject({teamAScore:11,teamBScore:5,winnerSide:'A'});expect(m.rallies).toEqual([[]]);expect(m.log[0]).toMatchObject({action:'manualScore',server:'Not recorded',reason});expect(m.starts).toHaveLength(1)
  expect(standings(s,'junior').find(r=>r.team.id==='junior-1')).toMatchObject({played:1,wins:1,for:11,against:5});expect(s.matches[1]).toEqual(before);expect(s.audit.at(-1)?.detail).toContain('Official court score sheet')
 })
 it('validates target, win-by, caps and terminal scores for completed games',()=>{
  for(const [a,b]of [[10,9],[11,10],[17,14],[18,16],[17,17]])expect(()=>final(ready(),56,a,b)).toThrow()
  const s=ready();final(s,56,17,16);expect(s.matches.find(m=>m.number===56)!.status).toBe('Final')
  const q=ready();act(q,{action:'seed',division:'mixed',order:q.teams.filter(t=>t.division==='mixed').map(t=>t.id),overrideReason:'Host ready for playoff test'});final(q,82,21,20);expect(q.matches.find(m=>m.number===82)!.winner).toBe('mixed-1')
 })
 it('requires all best-of-three games and rejects extra games after a match was won',()=>{
  const s=ready();act(s,{action:'seed',division:'junior',order:s.teams.filter(t=>t.division==='junior').map(t=>t.id),overrideReason:'Host approved early start'})
  const base={action:'manualScore',mode:'final',match:50,reason}
  expect(()=>act(s,{...base,games:[{a:11,b:5}]})).toThrow('all games')
  expect(()=>act(s,{...base,games:[{a:11,b:5},{a:11,b:6},{a:11,b:7}]})).toThrow('extra games')
  act(s,{...base,games:[{a:11,b:5},{a:5,b:11},{a:12,b:10}]});expect(s.matches.find(m=>m.number===50)!.winner).toBe('junior-1')
 })
 it('resumes a genuine current-score checkpoint, including server changes and corrections',()=>{
  const s=ready();act(s,{action:'manualScore',mode:'live',match:56,games:[{a:7,b:8}],service,reason});const m=s.matches.find(m=>m.number===56)!
  expect(serviceFor(s,m)).toMatchObject({serving:'B',server:1,receiver:0,court:'left',serverNumber:1,score:{A:7,B:8}})
  act(s,{action:'point',match:56,side:'B'});expect(m.games[0]).toMatchObject({teamAScore:7,teamBScore:9});expect(serviceFor(s,m)).toMatchObject({server:1,court:'right'})
  act(s,{action:'removePoint',match:56,side:'B'});expect(serviceFor(s,m)).toMatchObject({server:1,court:'left',score:{A:7,B:8}})
  act(s,{action:'point',match:56,side:'A'});expect(serviceFor(s,m)).toMatchObject({serving:'B',server:0,serverNumber:2,court:'right',score:{A:7,B:8}})
  act(s,{action:'point',match:56,side:'A'});expect(serviceFor(s,m)).toMatchObject({serving:'A',server:1,serverNumber:1,court:'right',score:{A:7,B:8}})
  act(s,{action:'point',match:56,side:'A'});expect(m.games[0].teamAScore).toBe(8)
 })
 it('keeps the entered score when later rallies are corrected and requires admin for checkpoint changes',()=>{
  const s=ready();act(s,{action:'manualScore',mode:'live',match:56,games:[{a:7,b:8}],service,reason});expect(()=>act(s,{action:'removePoint',match:56,side:'B'})).toThrow('no points')
  s.courtSessions['1']='active'
  expect(()=>applyEventAction(s,actionSchema.parse({action:'manualScore',mode:'final',match:56,games:[{a:11,b:0}],reason,version:s.matches.find(m=>m.number===56)!.version,requestId:randomUUID()}),{admin:false,court:1,session:'active'})).toThrow('Administrator')
 })
 it('requires current service and rejects already-complete live scores or an impossible opening turn',()=>{
  expect(()=>act(ready(),{action:'manualScore',mode:'live',match:56,games:[{a:7,b:8}],reason})).toThrow('current serving')
  expect(()=>act(ready(),{action:'manualScore',mode:'live',match:56,games:[{a:11,b:5}],service,reason})).toThrow('already complete')
  expect(()=>act(ready(),{action:'manualScore',mode:'live',match:56,games:[{a:7,b:8}],service:{...service,openingServe:true,serverNumber:2},reason})).toThrow('opening service')
 })
 it('requires an explicit next-game serving choice when the opening history was not recorded',()=>{
  const s=ready();act(s,{action:'seed',division:'junior',order:s.teams.filter(t=>t.division==='junior').map(t=>t.id),overrideReason:'Host approved early start'})
  act(s,{action:'manualScore',mode:'live',match:50,games:[{a:10,b:9}],service:{...service,serving:'A'},reason});const m=s.matches.find(m=>m.number===50)!
  act(s,{action:'point',match:50,side:'A'});expect(m.games[0].winnerSide).toBe('A');expect(m.status).toBe('Live')
  expect(()=>act(s,{action:'nextGame',match:50,server:0,receiver:0})).toThrow('first serving team')
  act(s,{action:'nextGame',match:50,serving:'B',server:1,receiver:0});expect(serviceFor(s,m)).toMatchObject({serving:'B',server:1,serverNumber:2,score:{A:0,B:0}})
 })
 it('keeps confirmed seeds only with explicit admin acknowledgement and updates pool statistics',()=>{
  const s=ready(),order=s.teams.filter(t=>t.division==='mixed').map(t=>t.id);act(s,{action:'seed',division:'mixed',order,overrideReason:'Host approved early start'})
  expect(()=>final(s,56)).toThrow('Explicitly keep')
  final(s,56,11,5,{preserveSeeds:true});expect(s.seeds.mixed).toEqual(order);expect(standings(s,'mixed').find(r=>r.team.id==='mixed-8')!.wins).toBe(1)
 })
 it('permits same-winner corrections after downstream play but blocks changes to participants',()=>{
  const s=ready();act(s,{action:'seed',division:'mixed',order:s.teams.filter(t=>t.division==='mixed').map(t=>t.id),overrideReason:'Host approved early start'});final(s,82,15,5);final(s,83,15,6)
  act(s,{action:'start',match:86,coinTossWinner:'A',serving:'A'})
  final(s,82,15,7);expect(s.matches.find(m=>m.number===86)!.a.team).toBe('mixed-1')
  expect(()=>final(s,82,5,15)).toThrow('dependent playoff')
  expect(()=>act(s,{action:'manualScore',mode:'live',match:82,games:[{a:7,b:8}],service,reason})).toThrow('dependent playoff')
 })
 it('lets past results be entered while that court is occupied, but blocks two live matches',()=>{
  const s=ready();act(s,{action:'start',match:1,coinTossWinner:'A',serving:'A'})
  final(s,56);expect(s.matches.find(m=>m.number===56)!.status).toBe('Final')
  expect(()=>act(s,{action:'manualScore',mode:'live',match:59,games:[{a:3,b:2}],service,reason})).toThrow('court already')
 })
 it('archives old scoring data, keeps real history, and hides replay archives from dashboard clients',()=>{
  const s=ready();act(s,{action:'start',match:56,coinTossWinner:'A',serving:'A'});act(s,{action:'point',match:56,side:'A'});const m=s.matches.find(m=>m.number===56)!,log=structuredClone(m.log)
  final(s,56);expect(m.scoreArchives!.at(-1)!.rallies).toEqual([['A']]);expect(m.log.slice(0,2)).toEqual(log);expect(m.log.at(-1)!.action).toBe('manualScore');expect(publicView(s,true).matches.find(m=>m.number===56)!.scoreArchives).toEqual([])
  const request=actionSchema.parse({action:'manualScore',mode:'final',match:56,games:[{a:11,b:6}],reason,version:m.version,requestId:randomUUID()});applyEventAction(s,request,{admin:true});const count=m.scoreArchives!.length;applyEventAction(s,request,{admin:true});expect(m.scoreArchives).toHaveLength(count)
  expect(()=>act(s,{action:'manualScore',mode:'final',match:56,games:[{a:11,b:7}],reason,version:m.version-1})).toThrow('changed on another device')
 })
 it('continues rally scoring from a checkpoint without traditional side-outs',()=>{
  const s=ready();s.settings.sideOutScoring=false;act(s,{action:'manualScore',mode:'live',match:56,games:[{a:7,b:8}],service,reason});const m=s.matches.find(m=>m.number===56)!
  act(s,{action:'point',match:56,side:'A'});expect(m.games[0]).toMatchObject({teamAScore:8,teamBScore:8,servingSide:'A'});act(s,{action:'removePoint',match:56,side:'A'});expect(m.games[0]).toMatchObject({teamAScore:7,teamBScore:8,servingSide:'B'})
 })
})
