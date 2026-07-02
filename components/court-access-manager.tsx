'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Check, Copy, Mail, MessageSquare, QrCode, RefreshCw, Share2, Ticket } from 'lucide-react'
import { StatusPill } from '@/components/status-pill'
import { Button, Card, SectionHeader } from '@/components/ui'
import QRCode from 'qrcode'

type CourtAccess = {
  courtNumber: number
  label: string
  code: string
}

function createCode() {
  const bytes = new Uint32Array(1)
  window.crypto.getRandomValues(bytes)
  return String(bytes[0] % 1000000).padStart(6, '0')
}

function buildCourts(count: number): CourtAccess[] {
  return Array.from({ length: count }, (_, index) => ({
    courtNumber: index + 1,
    label: `Court ${index + 1}`,
    code: String(100000 + index + 1)
  }))
}

export function CourtAccessManager() {
  const [courtCount, setCourtCount] = useState(4)
  const [courts, setCourts] = useState<CourtAccess[]>(() => buildCourts(4))
  const [selectedCourt, setSelectedCourt] = useState(1)
  const [copiedCourt, setCopiedCourt] = useState<number | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const copyTimer = useRef<number | null>(null)

  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const links = useMemo(
    () => courts.map((court) => ({ ...court, url: `${origin}/scorekeeper/court/${court.courtNumber}?code=${court.code}` })),
    [courts, origin]
  )
  const selectedLink = links.find((court) => court.courtNumber === selectedCourt) ?? links[0]

  useEffect(() => {
    if (!selectedLink?.url) return
    QRCode.toDataURL(selectedLink.url, { width: 240, margin: 1, errorCorrectionLevel: 'M' })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''))
  }, [selectedLink?.url])

  async function copyLink(court: CourtAccess & { url: string }) {
    await navigator.clipboard.writeText(court.url)
    setCopiedCourt(court.courtNumber)
    if (copyTimer.current) window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopiedCourt(null), 1500)
  }

  function regenerate(courtNumber: number) {
    setCourts((current) => current.map((court) => (court.courtNumber === courtNumber ? { ...court, code: createCode() } : court)))
  }

  async function shareLink(court: CourtAccess & { url: string }) {
    if (navigator.share) {
      await navigator.share({ title: `${court.label} scorekeeper link`, text: `Score ${court.label}`, url: court.url })
      return
    }
    await copyLink(court)
  }

  const linkAction = 'inline-flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50'

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line p-6">
        <SectionHeader
          eyebrow="Scorekeeper access"
          title="One scoring link per court"
          description="Text, email, or share a court link. Whoever opens it scores only that court. Regenerate a code to revoke a link."
          icon={Ticket}
          action={
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Courts
              <input
                type="number"
                min={1}
                max={24}
                value={courtCount}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10)
                  if (Number.isFinite(value)) {
                    const next = Math.min(24, Math.max(1, value))
                    setCourtCount(next)
                    setCourts(buildCourts(next))
                    setSelectedCourt((current) => Math.min(current, next))
                  }
                }}
                className="w-20 rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none"
              />
            </label>
          }
        />
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-lg border border-line">
          {links.map((court) => (
            <div
              key={court.courtNumber}
              className={`grid gap-3 border-b border-line p-4 last:border-b-0 lg:grid-cols-[96px_1fr_auto] lg:items-center ${
                selectedCourt === court.courtNumber ? 'bg-brand-50/40' : ''
              }`}
            >
              <button
                onClick={() => setSelectedCourt(court.courtNumber)}
                className={`text-left text-sm font-bold ${selectedCourt === court.courtNumber ? 'text-brand-700' : 'text-ink'}`}
              >
                {court.label}
              </button>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-slate-600">{court.url}</p>
                <p className="tabular mt-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Code {court.code}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => copyLink(court)} className={linkAction}>
                  {copiedCourt === court.courtNumber ? <Check size={13} /> : <Copy size={13} />}
                  {copiedCourt === court.courtNumber ? 'Copied' : 'Copy'}
                </button>
                <a href={`sms:?&body=${encodeURIComponent(court.url)}`} className={linkAction}>
                  <MessageSquare size={13} />
                  Text
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(`${court.label} scorekeeper link`)}&body=${encodeURIComponent(court.url)}`} className={linkAction}>
                  <Mail size={13} />
                  Email
                </a>
                <button onClick={() => shareLink(court)} className={linkAction}>
                  <Share2 size={13} />
                  Share
                </button>
                <button
                  onClick={() => regenerate(court.courtNumber)}
                  className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-ink/90"
                >
                  <RefreshCw size={13} />
                  New code
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-line bg-slate-50/60 p-5">
          <div className="flex items-center gap-2">
            <QrCode size={16} className="text-brand-700" />
            <p className="text-sm font-bold text-ink">{selectedLink?.label ?? 'Court'} QR</p>
          </div>
          <div className="mt-4 flex justify-center rounded-lg bg-white p-4 ring-1 ring-line">
            {qrDataUrl ? (
              <Image src={qrDataUrl} alt={`${selectedLink?.label ?? 'Court'} scorekeeper QR code`} width={220} height={220} unoptimized />
            ) : (
              <div className="h-[220px] w-[220px]" />
            )}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            QR is optional — if you can&apos;t print, use Copy, Text, Email, or Share to send the same court link.
          </p>
        </div>
      </div>
    </Card>
  )
}
