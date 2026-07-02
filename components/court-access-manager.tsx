'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Check, Copy, Mail, MessageSquare, QrCode, RefreshCw, Share2 } from 'lucide-react'
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

  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const selected = courts.find((court) => court.courtNumber === selectedCourt) ?? courts[0]

  const links = useMemo(() => {
    return courts.map((court) => ({
      ...court,
      url: `${origin}/scorekeeper/court/${court.courtNumber}?code=${court.code}`
    }))
  }, [courts, origin])

  const selectedLink = links.find((court) => court.courtNumber === selected?.courtNumber) ?? links[0]

  useEffect(() => {
    if (!selectedLink?.url) return

    QRCode.toDataURL(selectedLink.url, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M'
    }).then(setQrDataUrl).catch(() => setQrDataUrl(''))
  }, [selectedLink?.url])

  async function copyLink(court: CourtAccess & { url: string }) {
    await navigator.clipboard.writeText(court.url)
    setCopiedCourt(court.courtNumber)
    window.setTimeout(() => setCopiedCourt(null), 1500)
  }

  function regenerate(courtNumber: number) {
    setCourts((current) =>
      current.map((court) => (court.courtNumber === courtNumber ? { ...court, code: createCode() } : court))
    )
  }

  async function shareLink(court: CourtAccess & { url: string }) {
    if (navigator.share) {
      await navigator.share({
        title: `${court.label} scorekeeper link`,
        text: `Open this link to score ${court.label}.`,
        url: court.url
      })
      return
    }

    await copyLink(court)
  }

  return (
    <section className="border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Scorekeeper access</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Share one scoring link per court</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Send a court link by text, email, or share sheet. Whoever opens it scores only that court. Regenerate a code
            if a link should stop being used.
          </p>
        </div>
        <label className="grid gap-1 text-sm font-bold text-slate-700">
          Courts
          <input
            type="number"
            min={1}
            max={24}
            value={courtCount}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value, 10)
              if (Number.isFinite(value)) {
                const nextCourtCount = Math.min(24, Math.max(1, value))
                setCourtCount(nextCourtCount)
                setCourts(buildCourts(nextCourtCount))
              }
            }}
            className="w-28 border border-slate-300 px-3 py-2 text-slate-950"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden border border-slate-200">
          {links.map((court) => (
            <div key={court.courtNumber} className="grid gap-3 border-b border-slate-200 p-4 last:border-b-0 lg:grid-cols-[110px_1fr_auto] lg:items-center">
              <button
                onClick={() => setSelectedCourt(court.courtNumber)}
                className={`text-left font-black ${selectedCourt === court.courtNumber ? 'text-court-700' : 'text-slate-950'}`}
              >
                {court.label}
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-600">{court.url}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">Code {court.code}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => copyLink(court)} className="inline-flex items-center gap-1 bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                  {copiedCourt === court.courtNumber ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCourt === court.courtNumber ? 'Copied' : 'Copy'}
                </button>
                <a href={`sms:?&body=${encodeURIComponent(court.url)}`} className="inline-flex items-center gap-1 bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                  <MessageSquare size={14} />
                  Text
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`${court.label} scorekeeper link`)}&body=${encodeURIComponent(court.url)}`}
                  className="inline-flex items-center gap-1 bg-slate-100 px-3 py-2 text-xs font-black text-slate-700"
                >
                  <Mail size={14} />
                  Email
                </a>
                <button onClick={() => shareLink(court)} className="inline-flex items-center gap-1 bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                  <Share2 size={14} />
                  Share
                </button>
                <button onClick={() => regenerate(court.courtNumber)} className="inline-flex items-center gap-1 bg-slate-950 px-3 py-2 text-xs font-black text-white">
                  <RefreshCw size={14} />
                  Regenerate
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2">
            <QrCode className="text-court-700" />
            <p className="font-black text-slate-950">{selectedLink?.label ?? 'Court'} QR</p>
          </div>
          <div className="mt-5 flex justify-center bg-white p-4">
            {qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt={`${selectedLink?.label ?? 'Court'} scorekeeper QR code`}
                width={240}
                height={240}
                unoptimized
              />
            ) : null}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            QR is optional. If you cannot print, use Copy, Text, Email, or Share for the same court link.
          </p>
        </div>
      </div>
    </section>
  )
}
