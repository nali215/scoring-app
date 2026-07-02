import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { badmintonDemoMatches, badmintonDemoStandings, demoTournaments } from '@/lib/demo-data'

export default function PublicTournamentPage({ params }: { params: { slug: string } }) {
  const tournament = demoTournaments.find((item) => item.slug === params.slug) ?? demoTournaments[0]

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="success">Public no-login view</StatusPill>
            <StatusPill>{tournament.sport}</StatusPill>
          </div>
          <h1 className="mt-5 text-4xl font-black text-ink md:text-6xl">{tournament.name}</h1>
          <p className="mt-3 text-lg font-semibold text-slate-500">
            {tournament.venue} · {tournament.date} · {tournament.courts} courts
          </p>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
            Demo public page: spectators can see live scores and standings, but cannot edit anything. Submitted matches
            are locked from scorekeepers and can only be corrected by an admin.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Live scores</p>
                <h2 className="mt-2 text-3xl font-black text-ink">Badminton courts</h2>
              </div>
              <StatusPill tone="warning">Auto-refresh ready</StatusPill>
            </div>
            <div className="mt-6 space-y-3">
              {badmintonDemoMatches.map((match) => (
                <article key={`${match.court}-${match.teamA}`} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black uppercase tracking-wide text-court-700">{match.court}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {match.division} · {match.round}
                      </p>
                    </div>
                    <StatusPill tone={match.status === 'Submitted' ? 'success' : match.status === 'Queued' ? 'neutral' : 'warning'}>
                      {match.status}
                    </StatusPill>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <p className="text-xl font-black text-ink">{match.teamA}</p>
                    <p className="rounded-2xl bg-ink px-4 py-3 text-center text-2xl font-black text-white">{match.score}</p>
                    <p className="text-xl font-black text-ink md:text-right">{match.teamB}</p>
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Edit state: {match.editableBy}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Standings</p>
            <h2 className="mt-2 text-3xl font-black text-ink">Current leaders</h2>
            <div className="mt-6 space-y-3">
              {badmintonDemoStandings.map((standing) => (
                <div key={standing.team} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-black text-ink">
                        #{standing.rank} {standing.team}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{standing.division}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-court-700">
                        {standing.wins}-{standing.losses}
                      </p>
                      <p className="text-xs font-bold text-slate-500">W-L</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-600">
                    <div className="rounded-xl bg-white px-2 py-2">PF {standing.pointsFor}</div>
                    <div className="rounded-xl bg-white px-2 py-2">PA {standing.pointsAgainst}</div>
                    <div className="rounded-xl bg-white px-2 py-2">+{standing.differential}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
