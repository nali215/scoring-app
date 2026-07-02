import { AppHeader } from '@/components/app-header'
import { LiveScorekeeper } from '@/components/live-scorekeeper'
import { StatusPill } from '@/components/status-pill'
import { scorekeeperAssignments } from '@/lib/demo-data'
import { getLiveDemoState } from '@/lib/live-demo'

export default function ScorekeeperPage() {
  const initialState = getLiveDemoState()

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

        <LiveScorekeeper initialState={initialState} />
      </section>
    </main>
  )
}
