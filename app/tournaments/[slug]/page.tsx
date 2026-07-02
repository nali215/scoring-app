import { CalendarDays, Medal, Monitor, Table2 } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { badmintonDemoMatches, badmintonDemoSchedule, badmintonDemoStandings, courtViews, demoTournaments } from '@/lib/demo-data'

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
            <StatusPill>{tournament.courts} courts</StatusPill>
          </div>
          <h1 className="mt-5 text-4xl font-black text-ink md:text-6xl">{tournament.name}</h1>
          <p className="mt-3 text-lg font-semibold text-slate-500">
            {tournament.venue} · {tournament.date} · {tournament.timeWindow}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Format</p>
              <p className="mt-2 font-black text-ink">{tournament.format}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Regular games</p>
              <p className="mt-2 font-black text-ink">{tournament.regularFormat}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Playoffs</p>
              <p className="mt-2 font-black text-ink">{tournament.playoffFormat}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Live scores</p>
                <h2 className="mt-2 text-3xl font-black text-ink">Current court scores</h2>
              </div>
              <StatusPill tone="warning">Live board</StatusPill>
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
            <div className="flex items-center gap-3">
              <Medal className="text-court-600" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Standings</p>
                <h2 className="text-3xl font-black text-ink">Current leaders</h2>
              </div>
            </div>
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

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-court-600" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Schedule</p>
                <h2 className="text-3xl font-black text-ink">Today by time</h2>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              {badmintonDemoSchedule.map((match) => (
                <div key={`${match.time}-${match.court}`} className="grid gap-3 border-b border-slate-200 p-4 last:border-b-0 md:grid-cols-[90px_90px_1fr_auto] md:items-center">
                  <p className="font-black text-ink">{match.time}</p>
                  <p className="text-sm font-bold text-court-700">{match.court}</p>
                  <div>
                    <p className="font-black text-ink">{match.match}</p>
                    <p className="text-sm text-slate-500">
                      {match.division} · {match.phase}
                    </p>
                  </div>
                  <StatusPill tone={match.status === 'Live' ? 'warning' : match.status === 'Submitted' || match.status === 'Completed' ? 'success' : 'neutral'}>
                    {match.status}
                  </StatusPill>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Monitor className="text-court-600" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Court view</p>
                <h2 className="text-3xl font-black text-ink">Configured for {tournament.courts} courts</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {courtViews.slice(0, tournament.courts).map((court) => (
                <div key={court.court} className="rounded-2xl bg-ink p-5 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-2xl font-black">{court.court}</p>
                    <StatusPill tone={court.state === 'Live' ? 'warning' : court.state === 'Submitted' ? 'success' : 'neutral'}>
                      {court.state}
                    </StatusPill>
                  </div>
                  <p className="mt-4 text-lg font-black">{court.match}</p>
                  <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-center text-2xl font-black text-ink">{court.score}</p>
                  <p className="mt-3 text-sm text-slate-300">Scorekeeper: {court.scorekeeper}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
