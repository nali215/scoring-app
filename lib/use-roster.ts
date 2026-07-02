'use client'

import { useCallback, useEffect, useState } from 'react'
import { createEmptyRoster, type DraftTeam, type Roster } from '@/lib/roster'

export function useRoster() {
  const [roster, setRoster] = useState<Roster>(createEmptyRoster())
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/roster', { cache: 'no-store' })
      if (!response.ok) throw new Error('Unable to load roster')
      setRoster(await response.json())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load roster')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  const post = useCallback(async (body: object) => {
    const response = await fetch('/api/roster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error ?? 'Unable to update roster')
      return null
    }
    setRoster(payload.roster)
    setError(null)
    return payload
  }, [])

  const importDrafts = useCallback((drafts: DraftTeam[]) => post({ action: 'import', drafts }), [post])
  const updateTeam = useCallback(
    (teamId: string, patch: { name?: string; division?: string; seed?: number | null }) =>
      post({ action: 'updateTeam', teamId, patch }),
    [post]
  )
  const updatePlayer = useCallback(
    (
      teamId: string,
      playerId: string,
      patch: { firstName?: string; lastName?: string; email?: string | null; phone?: string | null }
    ) => post({ action: 'updatePlayer', teamId, playerId, patch }),
    [post]
  )
  const deleteTeam = useCallback((teamId: string) => post({ action: 'deleteTeam', teamId }), [post])
  const resetRoster = useCallback(() => post({ action: 'reset' }), [post])

  return { roster, error, loading, refresh, importDrafts, updateTeam, updatePlayer, deleteTeam, resetRoster }
}
