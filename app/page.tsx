import Link from 'next/link'
import { Activity, CalendarDays, ClipboardCheck, Monitor, ShieldCheck, Smartphone, Trophy, Users, type LucideIcon } from 'lucide-react'
import { ActionCard } from '@/components/action-card'
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

const roleCards = [
  {
    href: '/admin',
    title: 'Admin command center',
    description: 'A guided setup path for divisions, imports, rules, courts, schedules, displays, and corrections.',
    cta: 'Configure tournament',
    Icon: ClipboardCheck
  },
  {
    href: '/scorekeeper',
    title: 'Scorekeeper phone view',
    description: 'Large tap targets, current server context, undo, and final submit controls for live matches.',
    cta: 'Score a match',
    Icon: Smartphone
  },
  {
    href: '/display',
    title: 'TV display mode',
    description: 'High-contrast, oversized court boards designed for low-resolution gym and venue screens.',
    cta: 'Open display',
    Icon: Monitor
  }
]

const confidenceItems: Array<{ label: string; Icon: LucideIcon }> = [
  { label: 'One-tap scoring', Icon: Smartphone },
  { label: 'Rule lock warnings', Icon: ShieldCheck },
  { label: 'Court-ready displays', Icon: Monitor },
  { label: 'Standings from results', Icon: Trophy },
  { label: 'Team import workflow', Icon: Users },
  { label: 'Audit every correction', Icon: Activity }
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_34%),linear-gradient(180deg,#ffffff,#f8fafc)]">
      <AppHeader />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <StatusPill tone="success">Professional live tournament operations</StatusPill>
          <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-ink md:text-7xl">
            Run tournaments that feel organized from the first serve.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A clean operator-first app for admins, scorekeepers, displays, and spectators: fast to learn, hard to
            misuse, and designed to look credible on event day.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/admin" className="rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
              Start with the admin flow
            </Link>
            <Link href="/scorekeeper" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700">
              See the scorekeeper UX
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

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <StatusPill>Role-based entry points</StatusPill>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-ink md:text-5xl">Easy for every person at the event.</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Each role lands on the controls they need instead of a generic dashboard. Admins manage complexity;
            scorekeepers get speed; displays stay readable from across the room.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {roleCards.map((card) => (
            <ActionCard key={card.href} {...card} />
          ))}
        </div>
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

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="overflow-hidden rounded-[2rem] bg-ink shadow-panel">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-8 text-white md:p-10">
              <StatusPill tone="warning">Event-day confidence</StatusPill>
              <h2 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">Designed to avoid panic during live play.</h2>
              <p className="mt-5 text-base leading-7 text-slate-300">
                The app favors visible status, guarded actions, audit trails, and simple recovery paths so operators can
                make corrections without losing control of the tournament.
              </p>
            </div>
            <div className="grid gap-3 bg-white/5 p-6 md:grid-cols-2 md:p-8">
              {confidenceItems.map(({ label, Icon }) => (
                <div key={label} className="rounded-2xl bg-white p-5 text-ink">
                  <Icon className="text-court-600" />
                  <p className="mt-4 font-black">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
