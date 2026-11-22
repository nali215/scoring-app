import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { createEvent } from './event-seed'
import type { EventState } from './event-types'
import { prisma } from './prisma'
const documentId = 'urc-2026'
function directory() { return process.env.EVENT_DATA_DIR || path.join(process.cwd(), '.data') }
function requireLocal() {
  if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && process.env.ALLOW_LOCAL_STORAGE !== 'true')) throw new Error('Persistent database is not configured. Set DATABASE_URL and run npm run event:db before hosting.')
}
async function readLocal(): Promise<EventState | null> {
  try { return JSON.parse(await readFile(path.join(directory(), 'event.json'), 'utf8')) }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error }
}
export async function readEvent(): Promise<EventState> {
  if (process.env.DATABASE_URL) {
    const rows = await prisma.$queryRaw<{ data: EventState }[]>`SELECT data FROM "EventDocument" WHERE id = ${documentId}`
    return rows[0]?.data ?? createEvent()
  }
  requireLocal(); return (await readLocal()) ?? createEvent()
}
export async function mutateEvent(update: (state: EventState) => EventState): Promise<EventState> {
  if (process.env.DATABASE_URL) return prisma.$transaction(async tx => {
    await tx.$executeRaw`INSERT INTO "EventDocument" (id, data) VALUES (${documentId}, ${JSON.stringify(createEvent())}::jsonb) ON CONFLICT (id) DO NOTHING`
    const rows = await tx.$queryRaw<{ data: EventState }[]>`SELECT data FROM "EventDocument" WHERE id = ${documentId} FOR UPDATE`
    const next = update(rows[0].data)
    await tx.$executeRaw`UPDATE "EventDocument" SET data = ${JSON.stringify(next)}::jsonb WHERE id = ${documentId}`
    return next
  }, { timeout: 15000 })
  requireLocal(); await mkdir(directory(), { recursive: true, mode: 0o700 })
  const lock = path.join(directory(), 'event.lock')
  let acquired = false
  for (let i = 0; i < 100; i++) {
    try { await mkdir(lock); acquired = true; break }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; await new Promise(resolve => setTimeout(resolve, 50)) }
  }
  if (!acquired) throw new Error('Event storage is busy. See README for local crash recovery.')
  const temp = path.join(directory(), `${randomUUID()}.tmp`)
  try {
    const next = update((await readLocal()) ?? createEvent())
    await writeFile(temp, JSON.stringify(next), { mode: 0o600, flush: true })
    await rename(temp, path.join(directory(), 'event.json'))
    return next
  } finally { await rm(temp, { force: true }); await rm(lock, { recursive: true, force: true }) }
}
