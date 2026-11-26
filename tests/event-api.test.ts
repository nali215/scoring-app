import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { randomUUID } from 'node:crypto'
const session=vi.hoisted(()=>({admin:false,scorer:null as null|{court:number;session:string}}))
vi.mock('@/lib/auth',()=>({isAdminAuthed:async()=>session.admin,getScorerAuth:async()=>session.scorer}))
import { GET, POST } from '@/app/api/event/route'
import { mutateEvent, readEvent } from '@/lib/event-store'
import { isSameOrigin } from '@/lib/request-origin'
let dir=''
beforeEach(async()=>{dir=await mkdtemp(path.join(os.tmpdir(),'urc-api-'));vi.stubEnv('EVENT_DATA_DIR',dir);vi.stubEnv('DATABASE_URL','');vi.stubEnv('VERCEL','');vi.stubEnv('ALLOW_LOCAL_STORAGE','true');session.admin=false;session.scorer=null})
afterEach(async()=>{vi.unstubAllEnvs();await rm(dir,{recursive:true,force:true})})
const post=(body:object,headers:Record<string,string>={},suffix='')=>POST(new Request(`http://localhost:3100/api/event${suffix}`,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({requestId:randomUUID(),version:1,...body})}))
describe('event API authorization and visibility',()=>{
  it('hides the draft from spectators and rejects anonymous writes',async()=>{
    expect(await (await GET(new Request('http://localhost:3100/api/event'))).json()).toEqual({unpublished:true})
    expect((await post({action:'publish',published:true})).status).toBe(403)
    expect((await readEvent()).published).toBe(false)
  })
  it('allows same-origin organizer changes behind the Next adapter and blocks foreign origins',async()=>{
    session.admin=true
    expect(isSameOrigin(new Request('http://localhost:3100/api/event',{headers:{host:'127.0.0.1:3100',origin:'http://127.0.0.1:3100'}}))).toBe(true)
    expect((await post({action:'releaseScorer',court:1},{origin:'https://attacker.example'})).status).toBe(403)
    const result=await post({action:'releaseScorer',court:1})
    expect(result.status).toBe(200);expect(await result.json()).not.toHaveProperty('courtSessions')
  })
  it('allows a valid court to score only that court and never exposes private keys',async()=>{
    await mutateEvent(s=>{s.published=true;s.courtSessions={'1':'court-one-token'};return s})
    session.scorer={court:1,session:'court-one-token'};const response=await post({action:'start',coinTossWinner:'A',match:1,version:0},{'x-court-token':'court-one-token'},'?court=1')
    expect(response.status).toBe(200);expect(await response.json()).not.toHaveProperty('courtSessions')
    expect((await post({action:'start',coinTossWinner:'A',match:2,version:0},{'x-court-token':'court-one-token'},'?court=1')).status).toBe(403)
    expect((await post({action:'releaseScorer',court:2},{'x-court-token':'court-one-token'},'?court=1')).status).toBe(403)
  })
})
