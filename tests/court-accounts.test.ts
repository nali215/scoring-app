import {describe,it,expect} from 'vitest'
import {randomUUID} from 'node:crypto'
import {createPickleballEvent} from '@/lib/pickleball-seed'
import {applyEventAction,actionSchema,publicView} from '@/lib/event-engine'
import {checkScorerPassword} from '@/lib/scorer-credentials'
import {eventCourts} from '@/lib/event-types'
function act(s:ReturnType<typeof createPickleballEvent>,data:object){return applyEventAction(s,actionSchema.parse({version:s.version,requestId:randomUUID(),...data}),{admin:true})}
describe('configurable courts and scorer credentials',()=>{
 it('adds courts without changing results and never exposes credentials in any dashboard view',()=>{
  const s=createPickleballEvent(),before=structuredClone(s.matches)
  act(s,{action:'addCourt',username:'extra3',password:'Court3#'})
  expect(eventCourts(s)).toEqual([1,2,3]);expect(s.matches).toEqual(before)
  const account=s.scorerAccounts!['3'];expect(account.passwordHash).not.toContain('Court3#');expect(checkScorerPassword('Court3#',account.passwordHash)).toBe(true)
  expect(JSON.stringify(publicView(s))).not.toContain(account.passwordHash)
  expect(JSON.stringify(publicView(s,true))).not.toContain(account.passwordHash)
  expect(JSON.stringify(s.audit)).not.toContain('Court3#')
  expect(publicView(s,true)).toHaveProperty('scorerUsernames.3','extra3')
 })
 it('rejects duplicate or invalid usernames, unconfigured courts and scorer administration',()=>{
  const s=createPickleballEvent()
  expect(()=>act(s,{action:'addCourt',username:'COURT1',password:'Strong#123'})).toThrow('already assigned')
  expect(()=>act(s,{action:'addCourt',username:'a b',password:'Strong#123'})).toThrow()
  expect(()=>act(s,{action:'schedule',match:1,version:0,court:3,time:'10:00'})).toThrow('Add this court')
  s.courtSessions['1']='active'
  expect(()=>applyEventAction(s,actionSchema.parse({action:'addCourt',username:'extra',password:'Strong#123',requestId:randomUUID(),version:s.version}),{admin:false,court:1,session:'active'})).toThrow('Administrator access')
 })
 it('supports added courts beyond three for scoring and scheduling',()=>{
  const s=createPickleballEvent();s.published=true
  for(const court of [3,4])act(s,{action:'addCourt',username:`new-court${court}`,password:`NewCourt${court}#`})
  s.courtSessions['4']='court-four'
  const m=s.matches[0]
  applyEventAction(s,actionSchema.parse({action:'start',match:1,version:m.version,coinTossWinner:'A',requestId:randomUUID()}),{admin:false,court:4,session:'court-four'})
  expect(m.court).toBe(4);expect(m.status).toBe('Live')
  act(s,{action:'schedule',match:2,version:0,court:4,time:'10:20'})
  expect(s.matches[1].court).toBe(4)
 })
})
