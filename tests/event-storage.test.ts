import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { readEvent, mutateEvent } from '@/lib/event-store'
import { applyEventAction, actionSchema } from '@/lib/event-engine'
let dir=''
beforeEach(async()=>{dir=await mkdtemp(path.join(os.tmpdir(),'urc-storage-'));vi.stubEnv('EVENT_DATA_DIR',dir);vi.stubEnv('DATABASE_URL','');vi.stubEnv('VERCEL','');vi.stubEnv('ALLOW_LOCAL_STORAGE','true')})
afterEach(async()=>{vi.unstubAllEnvs();await rm(dir,{recursive:true,force:true})})
describe('durable local event storage',()=>{
  it('persists state to disk and rolls back rejected updates',async()=>{
    await mutateEvent(s=>{s.settings.venue='Saved venue';return s})
    expect((await readEvent()).settings.venue).toBe('Saved venue')
    await expect(mutateEvent(s=>{s.settings.venue='Must not persist';throw new Error('Reject')})).rejects.toThrow('Reject')
    expect(JSON.parse(await readFile(path.join(dir,'event.json'),'utf8')).settings.venue).toBe('Saved venue')
  })
  it('serializes concurrent score updates and rejects the stale writer',async()=>{
    await mutateEvent(s=>{s.published=true;return applyEventAction(s,actionSchema.parse({action:'start',match:1,version:0,requestId:randomUUID()}),{admin:true})})
    const results=await Promise.allSettled(['A','B'].map(side=>mutateEvent(s=>applyEventAction(s,actionSchema.parse({action:'point',match:1,side,version:1,requestId:randomUUID()}),{admin:true}))))
    expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1)
    const game=(await readEvent()).matches[0].games[0]
    expect(game.teamAScore+game.teamBScore).toBe(1)
  })
  it('refuses ephemeral Vercel storage without a database',async()=>{vi.stubEnv('VERCEL','1');await expect(readEvent()).rejects.toThrow('Persistent database')})
})
