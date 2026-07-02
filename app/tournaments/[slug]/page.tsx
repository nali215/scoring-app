import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { TournamentTabs } from '@/components/tournament-tabs'
import { tournaments } from '@/lib/app-data'
import { getLiveState } from '@/lib/live-state'

export default function PublicTournamentPage({ params }: { params: { slug: string } }) {
  const tournament = tournaments.find((item) => item.slug === params.slug)
  const initialState = getLiveState()

  return (
    <main className="min-h-screen bg-[#f3f5f8]">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6">
        <div className="mb-4">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-950">
            ← Tournaments
          </Link>
        </div>

        {!tournament ? (
          <div className="border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-2xl font-black text-slate-950">Tournament not found</p>
            <p className="mt-2 text-sm text-slate-500">Publish a tournament from Admin to make it available here.</p>
            <Link href="/" className="mt-6 inline-flex bg-slate-950 px-5 py-3 text-sm font-bold text-white">
              Back to tournaments
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={tournament.status === 'Live' ? 'warning' : 'neutral'}>{tournament.status}</StatusPill>
                <StatusPill>{tournament.sport}</StatusPill>
                <StatusPill>{tournament.courts} courts</StatusPill>
              </div>
              <h1 className="mt-3 text-3xl font-black text-slate-950">{tournament.name}</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {tournament.venue} · {tournament.date} · {tournament.timeWindow}
              </p>
            </div>

            <TournamentTabs initialState={initialState} />
          </>
        )}
      </section>
    </main>
  )
}

