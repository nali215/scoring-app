import Link from 'next/link'
import { Activity, CalendarDays, Monitor, ShieldCheck, type LucideIcon } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { StatCard } from '@/components/stat-card'
import { StatusPill } from '@/components/status-pill'
import { activeMatches, operationalChecks } from '@/lib/demo-data'

const featureCards: Array<{ title: string; body: string; Icon: LucideIcon }> = [
  { title: 'Rules', body: 'Pure scoring engines reject impossible states.', Icon: ShieldCheck },
  { title: 'Scheduling', body: 'Bracket feeders and BYEs are first-class.', Icon: CalendarDays },
  { title: 'Scorekeeping', body: 'Versioned writes prevent stale phones from clobbering matches.', Icon: Activity },
  { title: 'Displays', body: 'Read-only device tokens are hashed and revocable.', Icon: Monitor }
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_34%),linear-gradient(180deg,#ffffff,#f8fafc)]">
      <AppHeader />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <StatusPill tone="success">Vercel-ready tournament operations</StatusPill>
          <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-ink md:text-7xl">
            Run live pickleball and badminton events without chaos.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Configure divisions, lock scoring rules, schedule courts, score matches from phones, and keep TV displays
            and public standings synchronized from a trusted match snapshot.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/admin" className="rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
              Open admin command center
            </Link>
            <Link href="/scorekeeper" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700">
              Preview scorekeeper view
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-panel backdrop-blur">
          <div className="rounded-[1.5rem] bg-ink p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Live board</p>
                <h2 className="mt-1 text-2xl font-bold">Summer Open</h2>
              </div>
              <StatusPill tone="warning">3 courts</StatusPill>
            </div>
            <div className="mt-6 space-y-3">
              {activeMatches.map((match) => (
                <div key={match.court} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{match.court}</span>
                    <span>{match.division}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <p className="font-semibold">{match.teamA}</p>
                    <p className="rounded-xl bg-white px-3 py-2 text-xl font-black text-ink">{match.score}</p>
                    <p className="text-right font-semibold">{match.teamB}</p>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-court-100">{match.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-20 md:grid-cols-4">
        <StatCard label="Core roles" value="4" detail="Admin, scorekeeper, display, public viewer" />
        <StatCard label="Sports" value="2" detail="Pickleball side-out and badminton rally scoring" />
        <StatCard label="Trust model" value="100%" detail="Snapshots plus immutable score events" />
        <StatCard label="Deployment" value="Vercel" detail="Separate project, no REC app linkage" />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-4 lg:grid-cols-4">
          {featureCards.map(({ title, body, Icon }) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6">
              <Icon className="text-court-600" />
              <h3 className="mt-5 font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-ink">Operational guardrails</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {operationalChecks.map((check) => (
              <StatusPill key={check}>{check}</StatusPill>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
