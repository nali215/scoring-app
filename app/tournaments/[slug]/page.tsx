import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { TournamentTabs } from '@/components/tournament-tabs'
import { LinkButton } from '@/components/ui'
import { tournaments } from '@/lib/app-data'
import { getLiveState } from '@/lib/live-state'

export default function PublicTournamentPage({ params }: { params: { slug: string } }) {
  const tournament = tournaments.find((item) => item.slug === params.slug)
  const initialState = getLiveState()

  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink">
          <ArrowLeft size={15} />
          Tournaments
        </Link>

        {!tournament ? (
          <div className="mt-4 rounded-xl border border-line bg-white p-12 text-center shadow-card">
            <h1 className="text-lg font-bold text-ink">Tournament not found</h1>
            <p className="mt-1.5 text-sm text-slate-500">Publish a tournament from Admin to make it available here.</p>
            <LinkButton href="/" variant="primary" className="mt-6">
              Back to tournaments
            </LinkButton>
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-xl border border-line bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={tournament.status === 'Live' ? 'success' : 'neutral'} dot={tournament.status === 'Live'}>
                  {tournament.status}
                </StatusPill>
                <StatusPill tone="brand">{tournament.sport}</StatusPill>
                <StatusPill>{tournament.courts} courts</StatusPill>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{tournament.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {tournament.venue} · {tournament.date} · {tournament.timeWindow}
              </p>
            </div>

            <div className="mt-4">
              <TournamentTabs initialState={initialState} />
            </div>
          </>
        )}
      </section>
    </main>
  )
}
