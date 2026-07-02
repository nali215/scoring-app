'use client'

import { useCallback, useEffect, useState } from 'react'
import type { LiveState } from '@/lib/live-state'

export function useLiveScores(initialState?: LiveState) {
  const [state, setState] = useState<LiveState | null>(initialState ?? null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const response = await fetch('/api/live-scores', { cache: 'no-store' })
    if (!response.ok) throw new Error('Unable to load live scores')
    setState(await response.json())
    setError(null)
  }, [])

  const sendAction = useCallback(async (action: object) => {
    const response = await fetch('/api/live-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    })

    const payload = await response.json()

    if (!response.ok) {
      setError(payload.error ?? 'Unable to update live score')
      return
    }

    setState(payload)
    setError(null)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refresh()
    }, 2000)

    return () => window.clearInterval(timer)
  }, [refresh])

  return {
    state,
    error,
    refresh,
    sendAction
  }
}

