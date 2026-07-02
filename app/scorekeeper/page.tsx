import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'

export default function ScorekeeperPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppHeader theme="dark" />
      <section className="mx-auto max-w-xl px-4 pb-16 pt-6">
        <div className="rounded-[2rem] bg-white p-4 text-ink shadow-panel">
          <div className="rounded-[1.5rem] bg-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Court 1</p>
                <h1 className="mt-1 text-2xl font-black">Mixed Doubles</h1>
              </div>
              <StatusPill tone="success">Locked to you</StatusPill>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-800">Simple scorekeeper flow</p>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              Tap the side that won the rally. The app handles server state, side-outs, game completion, and stale update
              protection on the server.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ['Patel / Shah', '8'],
              ['Kim / Lopez', '6']
            ].map(([team, score]) => (
              <button
                key={team}
                className="rounded-[1.5rem] bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition active:scale-[0.98]"
              >
                <p className="text-sm font-semibold text-slate-500">{team}</p>
                <p className="mt-4 text-7xl font-black tracking-tight">{score}</p>
                <p className="mt-3 rounded-full bg-court-50 px-3 py-2 text-center text-sm font-bold text-court-700">Award point</p>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-[1.5rem] bg-ink p-5 text-white">
            <p className="text-sm text-slate-300">Current serve</p>
            <p className="mt-2 text-3xl font-black">Patel / Shah · Server 2</p>
            <p className="mt-1 text-sm text-slate-300">Displayed as 8-6-2 for pickleball doubles.</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="rounded-2xl border border-slate-300 px-4 py-4 font-bold text-slate-700">Undo last action</button>
            <button className="rounded-2xl bg-ink px-4 py-4 font-bold text-white">Submit final</button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-500">
            <div className="rounded-2xl bg-slate-100 px-2 py-3">Game 1</div>
            <div className="rounded-2xl bg-ink px-2 py-3 text-white">Game 2 live</div>
            <div className="rounded-2xl bg-slate-100 px-2 py-3">Best of 3</div>
          </div>
        </div>
      </section>
    </main>
  )
}
