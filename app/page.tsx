import Link from 'next/link'
import { CalendarDays, Eye, LockKeyhole, Trophy } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { badmintonDemoSchedule, demoTournaments } from '@/lib/demo-data'

export default function HomePage() {
  const liveTournament = demoTournaments[0]

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-ink p-8 text-white shadow-panel md:p-10">
            <StatusPill tone="success">Tournament list</StatusPill>
            <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">Naveed tournament dashboard</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Guests land here first. They pick a tournament and can view schedules, live scores, and standings without
              logging in. Admin controls stay tucked in the corner.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/tournaments/${liveTournament.slug}`}
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-ink"
              >
                Open demo tournament
              </Link>
              <Link
                href="/admin"
                className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-black text-white"
              >
                Admin login
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-court-50 text-court-700">
                <CalendarDays />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Today preview</p>
                <h2 className="text-2xl font-black text-ink">{liveTournament.name}</h2>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {badmintonDemoSchedule.slice(0, 4).map((match) => (
                <div key={`${match.time}-${match.court}`} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-black text-ink">{match.time}</p>
                    <StatusPill tone={match.status === 'Live' ? 'warning' : match.status === 'Submitted' ? 'success' : 'neutral'}>
                      {match.status}
                    </StatusPill>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {match.court} · {match.division}
                  </p>
                  <p className="mt-1 font-bold text-slate-800">{match.match}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Published tournaments</p>
            <h2 className="mt-2 text-3xl font-black text-ink">Choose a tournament</h2>
          </div>
          <Link href="/admin" className="hidden rounded-full bg-ink px-5 py-3 text-sm font-bold text-white md:inline-flex">
            Create new tournament
          </Link>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {demoTournaments.map((tournament) => (
            <Link
              key={tournament.slug}
              href={`/tournaments/${tournament.slug}`}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-panel"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={tournament.visibility === 'Published' ? 'success' : 'warning'}>{tournament.visibility}</StatusPill>
                <StatusPill>{tournament.sport}</StatusPill>
                <StatusPill>{tournament.courts} courts</StatusPill>
              </div>
              <h3 className="mt-5 text-3xl font-black text-ink">{tournament.name}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {tournament.venue} · {tournament.date} · {tournament.timeWindow}
              </p>
              <p className="mt-5 text-sm leading-6 text-slate-600">{tournament.publicSummary}</p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <Eye className="text-court-600" size={18} />
                  <p className="mt-3 text-sm font-black text-ink">Scores</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <CalendarDays className="text-court-600" size={18} />
                  <p className="mt-3 text-sm font-black text-ink">Schedule</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <Trophy className="text-court-600" size={18} />
                  <p className="mt-3 text-sm font-black text-ink">Standings</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <LockKeyhole />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">Admin access</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The admin login is in the corner. For the demo, use <strong>admin</strong> / <strong>changeme</strong>;
                the password can be changed from admin settings once authentication is connected.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
