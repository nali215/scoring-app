import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { scorekeeperAssignments } from '@/lib/demo-data'

export default function ScorekeeperPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppHeader theme="dark" />
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/10 p-5 text-white">
          <StatusPill tone="warning">Multiple phones supported</StatusPill>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">Each scorekeeper sees their own live match.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            During a real tournament, each phone gets assigned to a court or match. Live matches stay editable by the
            assigned scorekeeper; submitted matches become locked and admin-only.
          </p>
        </div>

        <div className="mb-6 grid gap-3 lg:grid-cols-3">
          {scorekeeperAssignments.map((assignment) => (
            <div key={assignment.court} className="rounded-3xl bg-white p-5 text-ink shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black">{assignment.court}</p>
                <StatusPill tone={assignment.state === 'Submitted' ? 'success' : 'warning'}>{assignment.state}</StatusPill>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-500">{assignment.division}</p>
              <p className="mt-1 text-lg font-black">{assignment.match}</p>
              <p className="mt-4 text-sm text-slate-600">Scorekeeper: {assignment.owner}</p>
              <p className="mt-4 rounded-full bg-slate-100 px-3 py-2 text-center text-sm font-black text-slate-700">
                {assignment.action}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] bg-white p-4 text-ink shadow-panel">
          <div className="rounded-[1.5rem] bg-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Court 1 · Badminton</p>
                <h1 className="mt-1 text-2xl font-black">Rahman / Ali vs Chen / Patel</h1>
              </div>
              <StatusPill tone="success">Locked to you</StatusPill>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-800">Simple scorekeeper flow</p>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              Tap the side that won the rally. The app handles badminton rally scoring, service side, game completion,
              and stale update protection on the server.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ['Rahman / Ali', '16'],
              ['Chen / Patel', '14']
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
            <p className="mt-2 text-3xl font-black">Rahman / Ali · Left service court</p>
            <p className="mt-1 text-sm text-slate-300">Badminton rally scoring: every rally awards a point.</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="rounded-2xl border border-slate-300 px-4 py-4 font-bold text-slate-700">Undo last action</button>
            <button className="rounded-2xl bg-ink px-4 py-4 font-bold text-white">Submit final and lock</button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-500">
            <div className="rounded-2xl bg-court-50 px-2 py-3 text-court-700">Game 1 submitted</div>
            <div className="rounded-2xl bg-ink px-2 py-3 text-white">Game 2 live</div>
            <div className="rounded-2xl bg-slate-100 px-2 py-3">Best of 3</div>
          </div>

          <div className="mt-4 rounded-[1.5rem] bg-rose-50 p-4 ring-1 ring-rose-100">
            <p className="text-sm font-black text-rose-800">Submitted score rule</p>
            <p className="mt-1 text-sm leading-6 text-rose-900">
              After final submit, this phone can no longer edit the match. Corrections move to the admin correction
              workflow with a required reason and audit log.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
