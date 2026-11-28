import {describe,it,expect} from 'vitest'
import {randomUUID} from 'node:crypto'
import {createPickleballEvent} from '@/lib/pickleball-seed'
import {appendMixedDoubles} from '@/lib/mixed-pickleball'
import {applyEventAction,actionSchema,rulesFor} from '@/lib/event-engine'
import {pickleballSnapshot} from '@/lib/event-service'
import {chronologicalMatches,standings,type EventState,type Match} from '@/lib/event-types'
function ready(){const s=createPickleballEvent();s.settings.courtCount=3;s.published=true;return appendMixedDoubles(s,'2026-11-28')}
function act(s:EventState,data:object){return applyEventAction(s,actionSchema.parse({requestId:randomUUID(),version:s.version,...data}),{admin:true})}
describe('Mixed Doubles PDF import',()=>{
 it('preserves existing data and imports all 13 teams, 26 pool matches and 7 playoff fixtures',()=>{
  const s=createPickleballEvent();s.settings.courtCount=3;const original=structuredClone(s);appendMixedDoubles(s,'2026-11-28')
  expect(s.teams.slice(0,23)).toEqual(original.teams);expect(s.matches.slice(0,55)).toEqual(original.matches);expect(s.matches).toHaveLength(88)
  const teams=s.teams.filter(t=>t.division==='mixed'),matches=s.matches.filter(m=>m.division==='mixed')
  expect(teams).toHaveLength(13);expect(teams.filter(t=>t.pool==='A')).toHaveLength(6);expect(teams.filter(t=>t.pool==='B')).toHaveLength(7)
  expect(matches.filter(m=>m.round==='Round robin')).toHaveLength(26)
  for(const t of teams)expect(matches.filter(m=>m.round==='Round robin'&&(m.a.team===t.id||m.b.team===t.id))).toHaveLength(4)
  expect(new Set(matches.map(m=>m.number)).size).toBe(33);expect(matches.every(m=>m.date==='2026-11-28')).toBe(true)
  expect(matches[0]).toMatchObject({number:56,court:1,time:'09:00',pool:'B',a:{team:'mixed-8'},b:{team:'mixed-13'}})
  expect(matches.find(m=>m.number===82)).toMatchObject({court:1,time:'12:20',a:{seed:1},b:{seed:8}})
  expect(matches.find(m=>m.number===85)).toMatchObject({court:1,time:'12:50',a:{seed:2},b:{seed:7}})
  expect(matches.at(-1)).toMatchObject({number:88,time:'15:00',a:{winner:86},b:{winner:87}})
  expect(chronologicalMatches(s,s.matches)[0].number).toBe(56)
  expect(()=>appendMixedDoubles(s,'2026-11-28')).toThrow('already present')
 })
 it('links unambiguous shared players while keeping ambiguous Arif identities separate',()=>{
  const s=ready();expect(s.teams.find(t=>t.id==='mixed-1')!.players[0]).toBe('javed')
  expect(s.teams.find(t=>t.id==='mixed-9')!.players).toEqual(['adiyan momin','arya manasiya'])
  expect(s.teams.find(t=>t.id==='mixed-13')!.players[1]).toBe('zia sunesra')
  expect(s.teams.find(t=>t.id==='mixed-4')!.players[0]).toBe('adil')
  expect(s.teams.find(t=>t.id==='adult-10')!.players[0]).toBe('aadil')
  expect(s.teams.find(t=>t.id==='mixed-2')!.players[0]).not.toBe(s.teams.find(t=>t.id==='mixed-8')!.players[0])
 })
 it('applies the mixed caps by stage while leaving Adult/Youth uncapped',()=>{
  const s=ready();expect(rulesFor(s,s.matches[0]).pointCap).toBeUndefined()
  const pool=s.matches.find(m=>m.number===56)!,quarter=s.matches.find(m=>m.number===82)!,semi=s.matches.find(m=>m.number===86)!
  expect(rulesFor(s,pool)).toMatchObject({pointsToWin:11,pointCap:17,bestOf:1,winBy:2})
  expect(rulesFor(s,quarter)).toMatchObject({pointsToWin:15,pointCap:21,bestOf:1})
  expect(rulesFor(s,semi)).toMatchObject({pointsToWin:11,pointCap:17,bestOf:3})
  for(const [m,tied]of [[pool,16],[quarter,20]] as const){const rules={...rulesFor(s,m),sideOutScoring:false};const rallies=Array.from({length:tied},()=>['A','B'] as const).flat();const tiedGame=pickleballSnapshot({serving:'A',server:0,receiver:0},rallies,rules);expect(tiedGame.winnerSide).toBeNull();expect(pickleballSnapshot({serving:'A',server:0,receiver:0},[...rallies,'A'],rules)).toMatchObject({winnerSide:'A',teamAScore:tied+1,teamBScore:tied})}
 })
 it('rehearses all mixed results, top-eight seeding and best-of-three final without changing other divisions',()=>{
  const s=ready(),original=structuredClone(s.matches.slice(0,55))
  for(const m of s.matches.filter(m=>m.division==='mixed')){
    if(m.round==='Quarterfinal'&&!s.seeds.mixed)act(s,{action:'seed',division:'mixed',order:s.teams.filter(t=>t.division==='mixed').map(t=>t.id)})
    act(s,{action:'start',match:m.number,version:m.version,coinTossWinner:'A',serving:'A'})
    const awaiting=()=>m.status==='Awaiting confirmation'
    while(!awaiting()){while(!m.games.at(-1)!.winnerSide)act(s,{action:'point',match:m.number,version:m.version,side:'A'});if(!awaiting())act(s,{action:'nextGame',match:m.number,version:m.version,server:0,receiver:0})}
    act(s,{action:'submit',match:m.number,version:m.version})
  }
  expect(s.matches.slice(0,55)).toEqual(original);expect(s.matches.filter(m=>m.division==='mixed').every(m=>m.status==='Final')).toBe(true);expect(s.matches.at(-1)!.winner).toBe('mixed-1')
 })
})
function rankingFixture(results:[string,string,number,number][]) {
 const s=ready();s.teams=s.teams.filter(t=>t.division==='mixed').slice(0,5);s.matches=results.map(([a,b,as,bs],i)=>({number:i+1,division:'mixed',round:'Round robin',a:{team:a},b:{team:b},court:1,time:'09:00',date:'2026-11-28',status:'Final',winner:a,games:[{teamAScore:as,teamBScore:bs,servingSide:'A',serverNumber:2,firstServerExceptionActive:false,serviceSide:'right',status:'completed',winnerSide:'A'}],rallies:[],starts:[],log:[],history:[],version:0} as Match));return s
}
describe('mixed house tie-breaks',()=>{
 it('uses completed head-to-head ahead of point difference when every tied team met',()=>{
  const s=rankingFixture([['mixed-1','mixed-2',17,16],['mixed-2','mixed-3',11,0]])
  const rows=standings(s,'mixed');expect(rows.slice(0,2).map(r=>r.team.id)).toEqual(['mixed-1','mixed-2']);expect(rows[0].headToHead).toBe(1);expect(rows[1].headToHead).toBe(0)
 })
 it('skips head-to-head when tied teams did not meet',()=>{
  const s=rankingFixture([['mixed-1','mixed-3',17,16],['mixed-2','mixed-4',11,0]])
  const rows=standings(s,'mixed');expect(rows[0].team.id).toBe('mixed-2');expect(rows.slice(0,2).every(r=>r.headToHead===null)).toBe(true)
 })
 it('uses scheduled opponents’ wins after equal wins, differential and points scored',()=>{
  const s=rankingFixture([['mixed-1','mixed-3',11,5],['mixed-2','mixed-4',11,5],['mixed-3','mixed-5',11,0]])
  s.teams[0].name='Zeta';s.teams[1].name='Alpha'
  const rows=standings(s,'mixed');expect(rows[0].team.id).toBe('mixed-1');expect(rows[0].opponentWins).toBe(1);expect(rows[1].opponentWins).toBe(0)
 })
})
