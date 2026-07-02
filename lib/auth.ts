import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE = 'sk_admin'

const SESSION_SECRET = process.env.AUTH_SECRET || 'scoring-app-dev-secret-change-in-vercel'

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'changeme'
}

export function expectedToken(): string {
  return createHmac('sha256', SESSION_SECRET).update('admin-session-v1').digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function verifyPassword(input: string): boolean {
  return safeEqual(input, adminPassword())
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(ADMIN_COOKIE)?.value
  if (!token) return false
  return safeEqual(token, expectedToken())
}

export function usingDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD
}
