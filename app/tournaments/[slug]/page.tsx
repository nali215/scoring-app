import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { TournamentTabs } from '@/components/tournament-tabs'
import { badmintonDemoMatches, badmintonDemoSchedule, badmintonDemoStandings, demoTournaments } from '@/lib/demo-data'

export default function PublicTournamentPage({ params }: { params: { slug: string } }) {
  const tournament = demoTournaments.find((item) => item.slug === params.slug) ?? demoTournaments[0]

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader />
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
        <div className="mb-4">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-ink">
            ← Tournaments
          </Link>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={tournament.status === 'Live demo' ? 'warning' : 'neutral'}>{tournament.status}</StatusPill>
            <StatusPill>{tournament.sport}</StatusPill>
            <StatusPill>{tournament.courts} courts</StatusPill>
          </div>
          <h1 className="mt-3 text-3xl font-black text-ink">{tournament.name}</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {tournament.venue} · {tournament.date} · {tournament.timeWindow}
          </p>
        </div>

        <TournamentTabs matches={badmintonDemoMatches} standings={badmintonDemoStandings} schedule={badmintonDemoSchedule} />
      </section>
    </main>
  )
}
