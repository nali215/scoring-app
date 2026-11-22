import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
try {
  await db.$executeRaw`CREATE TABLE IF NOT EXISTS "EventDocument" (id TEXT PRIMARY KEY, data JSONB NOT NULL)`
  console.log('Event storage is ready.')
} finally { await db.$disconnect() }
