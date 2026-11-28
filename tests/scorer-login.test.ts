import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest'
import {mkdtemp,rm} from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {randomUUID} from 'node:crypto'
vi.mock('next/headers',()=>({cookies:async()=>({get:()=>undefined})}))
import {POST} from '@/app/api/scorer/login/route'
import {readEvent,mutateEvent} from '@/lib/event-store'
import {verifyScorerToken} from '@/lib/auth'
import {actionSchema,applyEventAction} from '@/lib/event-engine'
let dir=''
beforeEach(async()=>{dir=await mkdtemp(path.join(os.tmpdir(),'urc-login-'));vi.stubEnv('EVENT_DATA_DIR',dir);vi.stubEnv('DATABASE_URL','');vi.stubEnv('VERCEL','');vi.stubEnv('ALLOW_LOCAL_STORAGE','true');vi.stubEnv('AUTH_SECRET','unique-test-secret-with-more-than-32-characters');vi.stubEnv('COURT1_PASSWORD','Court1!')})
afterEach(async()=>{vi.unstubAllEnvs();await rm(dir,{recursive:true,force:true})})
const login=(username='court1',password='Court1!')=>POST(new Request('http://localhost/api/scorer/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})}))
describe('court username/password sessions',()=>{
 it('logs in, binds the court, and replaces the previous device session',async()=>{
  const first=await login();expect(first.status).toBe(200);expect(await first.json()).toEqual({court:1})
  const raw=first.cookies.get('sk_scorer')!.value,auth=verifyScorerToken(raw)!
  expect(auth.court).toBe(1);expect((await readEvent()).courtSessions['1']).toBe(auth.session)
  const second=await login();expect(second.status).toBe(200)
  const state=await readEvent();expect(state.courtSessions['1']).not.toBe(auth.session)
  expect(()=>applyEventAction(state,actionSchema.parse({action:'start',coinTossWinner:'A',match:1,version:0,requestId:randomUUID()}),{admin:false,...auth})).toThrow('session ended')
 })
 it('rejects a wrong password and disabled court',async()=>{
  expect((await login('court1','wrong')).status).toBe(401)
  await mutateEvent(s=>{s.scorerEnabled['1']=false;return s})
  expect((await login()).status).toBe(403)
 })
})

it('starts with two courts and rejects the old third court account',async()=>{
 vi.stubEnv('COURT3_PASSWORD','Court3#')
 expect((await readEvent()).settings.courtCount).toBe(2)
 expect((await login('court3','Court3#')).status).toBe(401)
})
it('authenticates an admin-created custom account and invalidates its session on credential changes',async()=>{
 await mutateEvent(s=>applyEventAction(s,actionSchema.parse({action:'addCourt',username:'Spare_Court',password:'Custom#123',requestId:randomUUID(),version:s.version}),{admin:true}))
 const first=await login('SPARE_COURT','Custom#123');expect(first.status).toBe(200);expect(await first.json()).toEqual({court:3})
 const auth=verifyScorerToken(first.cookies.get('sk_scorer')!.value)!
 await mutateEvent(s=>applyEventAction(s,actionSchema.parse({action:'scorerAccount',court:3,username:'extra-court',password:'Changed#123',requestId:randomUUID(),version:s.version}),{admin:true}))
 const state=await readEvent();expect(state.courtSessions['3']).toBeUndefined()
 expect(()=>applyEventAction(state,actionSchema.parse({action:'start',coinTossWinner:'A',match:1,version:0,requestId:randomUUID()}),{admin:false,...auth})).toThrow('session ended')
 expect((await login('spare_court','Custom#123')).status).toBe(401)
 expect((await login('extra-court','Changed#123')).status).toBe(200)
})
