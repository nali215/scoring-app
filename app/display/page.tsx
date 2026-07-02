import { LiveDisplay } from '@/components/live-display'
import { demoTournaments } from '@/lib/demo-data'
import { getLiveDemoState } from '@/lib/live-demo'

export default function DisplayPage() {
  const tournament = demoTournaments[0]
  const initialState = getLiveDemoState()

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

        <LiveDisplay initialState={initialState} courts={tournament.courts} />
      </section>
    </main>
  )
}
