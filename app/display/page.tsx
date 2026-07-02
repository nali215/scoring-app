import { activeMatches } from '@/lib/demo-data'

export default function DisplayPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col rounded-[2rem] border border-white/10 bg-slate-950 p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-2xl font-bold text-court-500">Summer Open</p>
            <h1 className="mt-2 text-6xl font-black tracking-tight">Live Courts</h1>
          </div>
          <p className="rounded-full bg-court-500 px-6 py-3 text-2xl font-black text-black">LIVE</p>
        </div>

        <div className="grid flex-1 gap-5 py-6">
          {activeMatches.map((match) => (
            <article key={match.court} className="grid grid-cols-[220px_1fr_260px_1fr] items-center gap-6 rounded-[2rem] bg-white p-6 text-ink">
              <div>
                <p className="text-4xl font-black">{match.court}</p>
                <p className="mt-2 text-lg font-semibold text-slate-500">{match.division}</p>
              </div>
              <p className="text-4xl font-black">{match.teamA}</p>
              <p className="rounded-[1.5rem] bg-ink px-6 py-5 text-center text-5xl font-black text-white">{match.score}</p>
              <p className="text-right text-4xl font-black">{match.teamB}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

