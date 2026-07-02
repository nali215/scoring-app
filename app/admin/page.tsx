import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { WorkflowStep } from '@/components/workflow-step'

const setupSteps = [
  ['Tournament profile', 'Venue, sport, divisions, public visibility'],
  ['Teams and players', 'Manual entry or validated CSV/XLSX import'],
  ['Rules lock', 'Pickleball or badminton presets with division overrides'],
  ['Schedule generation', 'Courts, pools, brackets, BYEs, and feeder slots'],
  ['Operations', 'Scorekeeper assignment, display devices, audit log']
]

const readinessChecks = [
  ['Public page', 'Decide what spectators can see before the schedule is final.'],
  ['Rules locked', 'Prevent accidental scoring changes after the first match starts.'],
  ['Displays paired', 'Use revocable read-only display links for TVs and court screens.'],
  ['Scorekeepers assigned', 'Keep one active scorekeeper lock per match to avoid conflicts.']
]

const correctionRules = [
  'Scorekeepers can edit only assigned live matches.',
  'Final submit locks the match for scorekeepers.',
  'Only admins can reopen or correct submitted scores.',
  'Every admin correction requires a reason and audit entry.'
]

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <div className="rounded-[2rem] bg-ink p-8 text-white shadow-panel md:p-10">
          <StatusPill tone="success">Admin command center</StatusPill>
          <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">Build, lock, and operate the tournament.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            A guided operations surface for setup, imports, rules, schedules, corrections, and audit history. The goal
            is to make the right next step obvious, even for a busy tournament director.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          {setupSteps.map(([title, description], index) => (
            <WorkflowStep key={title} index={index + 1} title={title} description={description} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Readiness checklist</p>
                <h2 className="mt-3 text-3xl font-black text-ink">Know what still needs attention.</h2>
              </div>
              <StatusPill tone="warning">Draft</StatusPill>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {readinessChecks.map(([title, description]) => (
                <div key={title} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <p className="font-black text-ink">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-court-600 p-6 text-white shadow-sm md:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-100">Operator UX rule</p>
            <h2 className="mt-3 text-3xl font-black">No mystery meat controls.</h2>
            <p className="mt-4 text-sm leading-7 text-court-50">
              Every destructive or tournament-changing action should explain what it changes, ask for confirmation, and
              write an audit log entry.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Score control policy</p>
              <h2 className="mt-3 text-3xl font-black text-ink">Live phones are fast; submitted scores are protected.</h2>
            </div>
            <StatusPill tone="success">Admin-only corrections</StatusPill>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {correctionRules.map((rule) => (
              <div key={rule} className="rounded-2xl bg-slate-50 p-5 text-sm font-bold leading-6 text-slate-700 ring-1 ring-slate-200">
                {rule}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
