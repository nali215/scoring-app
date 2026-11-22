import { cookies } from 'next/headers'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
export const ADMIN_COOKIE = 'sk_admin'
export const SCORER_COOKIE = 'sk_scorer'
function secret() { return process.env.AUTH_SECRET || '' }
export function usingDefaultPassword() { return !process.env.ADMIN_PASSWORD || secret().length < 32 }
function equal(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y) }
export function verifyPassword(input: string) { return !usingDefaultPassword() && equal(input, process.env.ADMIN_PASSWORD!) }
export function expectedToken() {
  if (usingDefaultPassword()) throw new Error('Admin access is not configured.')
  const payload = `${Date.now() + 12 * 60 * 60 * 1000}.${randomBytes(16).toString('hex')}`
  return `${payload}.${createHmac('sha256', secret()).update(payload).digest('hex')}`
}
export function verifyToken(token: string) {
  if (usingDefaultPassword()) return false
  const [expiry, nonce, signature, extra] = token.split('.')
  if (extra || !expiry || !nonce || !signature || !Number.isFinite(Number(expiry)) || Number(expiry) <= Date.now()) return false
  return equal(signature, createHmac('sha256', secret()).update(`${expiry}.${nonce}`).digest('hex'))
}
export async function isAdminAuthed() { return verifyToken((await cookies()).get(ADMIN_COOKIE)?.value ?? '') }
export function verifyScorerPassword(court: number, input: string) {
  const configured = process.env[`COURT${court}_PASSWORD`]
  return [1,2,3].includes(court) && Boolean(configured) && secret().length >= 32 && equal(input, configured!)
}
export function scorerToken(court: number, session: string) {
  const payload = `${court}.${Date.now()+12*60*60*1000}.${session}`
  return `${payload}.${createHmac('sha256',secret()).update(payload).digest('hex')}`
}
export function verifyScorerToken(token: string): {court: number; session: string} | null {
  if (secret().length < 32) return null
  const [court,expiry,session,signature,extra]=token.split('.')
  if(extra||!session||!signature||![1,2,3].includes(Number(court))||!Number.isFinite(Number(expiry))||Number(expiry)<=Date.now())return null
  return equal(signature,createHmac('sha256',secret()).update(`${court}.${expiry}.${session}`).digest('hex'))?{court:Number(court),session}:null
}
export async function getScorerAuth() { return verifyScorerToken((await cookies()).get(SCORER_COOKIE)?.value??'') }
