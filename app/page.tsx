import Link from 'next/link'
import { CalendarPlus, Search } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { tournaments } from '@/lib/app-data'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f3f5f8]">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6">
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Tournaments</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Public tournament scores, standings, and schedules.</p>
          </div>
          <div className="flex gap-2">
            <div className="hidden items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm md:flex">
              <Search size={16} />
              Search tournaments
            </div>
            <Link href="/admin" className="inline-flex items-center gap-2 bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm">
              <CalendarPlus size={16} />
              New tournament
            </Link>
          </div>
        </div>

        {tournaments.length === 0 ? (
          <div className="border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-2xl font-black text-slate-950">No tournaments published</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Create a tournament from Admin, add divisions and teams, generate a schedule, then publish it here for
              players and spectators.
            </p>
            <Link href="/admin" className="mt-6 inline-flex bg-slate-950 px-5 py-3 text-sm font-bold text-white">
              Open admin
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.slug}
                href={`/tournaments/${tournament.slug}`}
                className="grid gap-3 border-b border-slate-200 p-4 transition last:border-b-0 hover:bg-slate-50 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-950">{tournament.name}</h2>
                    <StatusPill tone={tournament.status === 'Live' ? 'warning' : 'neutral'}>{tournament.status}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {tournament.sport} · {tournament.venue} · {tournament.date} · {tournament.timeWindow}
                  </p>
                </div>
                <div className="flex items-center gap-2 md:justify-end">
                  <StatusPill>{tournament.courts} courts</StatusPill>
                  <StatusPill tone={tournament.visibility === 'Public' ? 'success' : 'neutral'}>{tournament.visibility}</StatusPill>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

