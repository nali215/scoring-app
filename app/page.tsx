import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { demoTournaments } from '@/lib/demo-data'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader />
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-ink">Tournaments</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Select a tournament to view games, standings, and schedule.</p>
          </div>
          <Link href="/admin" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">
            Admin
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {demoTournaments.map((tournament) => (
            <Link
              key={tournament.slug}
              href={`/tournaments/${tournament.slug}`}
              className="grid gap-3 border-b border-slate-200 p-4 transition last:border-b-0 hover:bg-slate-50 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-ink">{tournament.name}</h2>
                  <StatusPill tone={tournament.status === 'Live demo' ? 'warning' : 'neutral'}>{tournament.status}</StatusPill>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {tournament.sport} · {tournament.venue} · {tournament.date} · {tournament.timeWindow}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tournament.divisions.map((division) => (
                    <span key={division} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {division}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <StatusPill>{tournament.courts} courts</StatusPill>
                <StatusPill tone={tournament.visibility === 'Published' ? 'success' : 'neutral'}>{tournament.visibility}</StatusPill>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
