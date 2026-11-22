import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('next/headers',()=>({cookies:async()=>({get:()=>undefined})}))
import { expectedToken, verifyToken, verifyPassword } from '@/lib/auth'
afterEach(()=>{vi.unstubAllEnvs();vi.useRealTimers()})
describe('organizer sessions',()=>{
  it('fails closed without credentials',()=>{vi.stubEnv('AUTH_SECRET','');vi.stubEnv('ADMIN_PASSWORD','');expect(verifyPassword('changeme')).toBe(false);expect(verifyToken('anything')).toBe(false)})
  it('rejects forged and expired cookies',()=>{
    vi.stubEnv('AUTH_SECRET','test-secret-with-at-least-thirty-two-characters');vi.stubEnv('ADMIN_PASSWORD','unique-test-password')
    const token=expectedToken();expect(verifyToken(token)).toBe(true);expect(verifyToken(token+'bad')).toBe(false)
    vi.useFakeTimers();vi.setSystemTime(Date.now()+13*60*60*1000);expect(verifyToken(token)).toBe(false)
  })
})
