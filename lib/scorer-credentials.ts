import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
export function hashScorerPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}
export function checkScorerPassword(password: string, encoded: string) {
  const [scheme, salt, hash, extra] = encoded.split(':')
  if (scheme !== 'scrypt' || extra || !/^[a-f0-9]{32}$/.test(salt ?? '') || !/^[a-f0-9]{128}$/.test(hash ?? '')) return false
  const expected = Buffer.from(hash, 'hex')
  return timingSafeEqual(expected, scryptSync(password, salt, 64))
}
