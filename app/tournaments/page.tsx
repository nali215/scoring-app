import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { badmintonDemoMatches, demoTournaments } from '@/lib/demo-data'

export default function PublicTournamentsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8">
        <div className="rounded-[2rem] bg-ink p-8 text-white shadow-panel md:p-10">
          <StatusPill tone="success">No login required</StatusPill>
          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Public tournament viewer for players, families, and spectators.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Visitors can browse published tournaments, open one, and see live courts, submitted results, and standings
            without admin or scorekeeper access.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          {demoTournaments.map((tournament) => (
            <Link
              key={tournament.slug}
              href={`/tournaments/${tournament.slug}`}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-panel"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="success">{tournament.status}</StatusPill>
                <StatusPill>{tournament.sport}</StatusPill>
              </div>
              <h2 className="mt-5 text-3xl font-black text-ink">{tournament.name}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {tournament.venue} · {tournament.date}
              </p>
              <p className="mt-5 text-sm leading-6 text-slate-600">{tournament.publicSummary}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {tournament.divisions.map((division) => (
                  <span key={division} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {division}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-sm font-black text-court-700">Open live tournament →</p>
            </Link>
          ))}

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Live preview</p>
            <h2 className="mt-3 text-3xl font-black text-ink">What guests see first.</h2>
            <div className="mt-6 space-y-3">
              {badmintonDemoMatches.slice(0, 3).map((match) => (
                <div key={`${match.court}-${match.teamA}`} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-4 text-sm font-bold text-slate-500">
                    <span>{match.court}</span>
                    <span>{match.status}</span>
                  </div>
                  <p className="mt-3 font-black text-ink">
                    {match.teamA} vs {match.teamB}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{match.score}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

