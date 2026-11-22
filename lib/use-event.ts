'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { EventView } from './event-types'

export function useEvent(court?: number) {
  const [state, setState] = useState<EventView | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unpublished, setUnpublished] = useState(false)
  const [lastSync, setLastSync] = useState('')
  const busy = useRef(false), version = useRef(0)
  const endpoint = `/api/event${court ? `?court=${court}` : ''}`
  const accept = useCallback((payload: EventView) => {
    if (payload.version >= version.current) { version.current = payload.version; setState(payload) }
    setLastSync(new Date().toLocaleTimeString()); setError(''); setUnpublished(false)
  }, [])
  const refresh = useCallback(async () => {
    if (busy.current) return
    try {
      const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load tournament.')
      if (payload.unpublished) { setUnpublished(true); setState(null); setError('') }
      else accept(payload)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Connection lost. Refresh before scoring.') }
    finally { setLoading(false) }
  }, [endpoint, accept])
  useEffect(() => {
    let stopped = false, timer: ReturnType<typeof setTimeout>
    const poll = async () => { await refresh(); if (!stopped) timer = setTimeout(poll, 3000) }
    void poll()
    return () => { stopped = true; clearTimeout(timer) }
  }, [refresh])
  const send = useCallback(async (action: object): Promise<EventView | null> => {
    if (busy.current) return null
    busy.current = true; setPending(true); setError('')
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: version.current, requestId: crypto.randomUUID(), ...action }), signal: AbortSignal.timeout(15000) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to save.')
      accept(payload); return payload
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Save uncertain. Refresh to check the score before entering another point.'); return null }
    finally { busy.current = false; setPending(false) }
  }, [endpoint, accept])
  return { state, error, pending, loading, unpublished, lastSync, refresh, send }
}
