'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole } from 'lucide-react'
import { Button, inputClass } from '@/components/ui'

export function AdminLoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setError(payload.error ?? 'Login failed')
        setPending(false)
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Login failed. Try again.')
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="grid gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Admin password</span>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
          placeholder="Enter admin password"
        />
      </label>
      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending || password.length === 0}>
        <LockKeyhole size={16} />
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
