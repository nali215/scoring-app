import Link from 'next/link'
import { CalendarPlus, ChevronRight, ListChecks, Trophy } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { LinkButton } from '@/components/ui'
import { tournaments } from '@/lib/app-data'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-brand-600" />
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Tournaments</h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">Live scores, standings, and schedules — no login needed.</p>
          </div>
          <LinkButton href="/admin" variant="primary">
            <CalendarPlus size={16} />
            New tournament
          </LinkButton>
        </div>

        {tournaments.length === 0 ? (
          <div className="rounded-xl border border-line bg-white p-12 text-center shadow-card">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <ListChecks size={22} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-ink">No tournaments yet</h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">
              Create a tournament in Admin, import your teams, generate a schedule, then publish it here for players and
              spectators to follow.
            </p>
            <LinkButton href="/admin" variant="primary" className="mt-6">
              Open Admin
            </LinkButton>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.slug}
                href={`/tournaments/${tournament.slug}`}
                className="flex items-center justify-between gap-4 border-b border-line p-4 transition-colors last:border-b-0 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-ink">{tournament.name}</h2>
                    <StatusPill tone={tournament.status === 'Live' ? 'success' : 'neutral'} dot={tournament.status === 'Live'}>
                      {tournament.status}
                    </StatusPill>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {tournament.sport} · {tournament.venue} · {tournament.date} · {tournament.timeWindow}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusPill>{tournament.courts} courts</StatusPill>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
