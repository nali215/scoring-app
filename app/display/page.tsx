import { courtViews, demoTournaments } from '@/lib/demo-data'

export default function DisplayPage() {
  const tournament = demoTournaments[0]

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-[2rem] border border-white/10 bg-slate-950 p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-2xl font-bold text-court-500">{tournament.name}</p>
            <h1 className="mt-2 text-6xl font-black tracking-tight">Live Courts</h1>
            <p className="mt-2 text-xl font-semibold text-slate-300">
              {tournament.sport} · {tournament.courts} courts configured by admin
            </p>
          </div>
          <p className="rounded-full bg-court-500 px-6 py-3 text-2xl font-black text-black">LIVE</p>
        </div>

        <div className="grid flex-1 gap-5 py-6 lg:grid-cols-2">
          {courtViews.slice(0, tournament.courts).map((court) => (
            <article key={court.court} className="rounded-[2rem] bg-white p-6 text-ink">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-5xl font-black">{court.court}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-500">Scorekeeper: {court.scorekeeper}</p>
                </div>
                <p className="rounded-full bg-ink px-5 py-3 text-2xl font-black text-white">{court.state}</p>
              </div>
              <p className="mt-8 min-h-20 text-4xl font-black leading-tight">{court.match}</p>
              <p className="mt-6 rounded-[1.5rem] bg-court-500 px-6 py-5 text-center text-5xl font-black text-black">{court.score}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
