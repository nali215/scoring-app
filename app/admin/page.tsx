import { CalendarDays, FileSpreadsheet, LockKeyhole, Pencil, Settings2, ShieldCheck, Users } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'
import { WorkflowStep } from '@/components/workflow-step'
import { demoTeams, demoTournaments, divisionOptions, importColumns, sportDefaults } from '@/lib/demo-data'

const setupSteps = [
  ['Login', 'Default demo admin is admin / changeme. Change it after first setup.'],
  ['Tournament type', 'Choose badminton or pickleball, then start from recommended rule defaults.'],
  ['Categories', 'Enable men, women, kids, singles, doubles, and mixed doubles divisions.'],
  ['Import teams', 'Upload CSV/XLSX, map columns, preview, then edit teams or player names.'],
  ['Schedule', 'Set days, time windows, court count, game length, and playoff format.'],
  ['Publish', 'Open the no-login public page and TV display views when ready.']
]

const correctionRules = [
  'Scorekeepers can edit only assigned live matches.',
  'Final submit locks the match for scorekeepers.',
  'Only admins can reopen or correct submitted scores.',
  'Every admin correction requires a reason and audit entry.'
]

export default function AdminPage() {
  const tournament = demoTournaments[0]

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] bg-ink p-8 text-white shadow-panel md:p-10">
            <StatusPill tone="success">Admin area</StatusPill>
            <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">Set up and run your tournaments.</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              This is your private control room: create tournaments, choose sport defaults, add categories, import
              teams, set courts and schedules, and publish public views.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-ink">
                <LockKeyhole />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Demo login</p>
                <h2 className="text-2xl font-black text-ink">Admin credentials</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Username</p>
                <p className="mt-2 text-2xl font-black text-ink">admin</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Password</p>
                <p className="mt-2 text-2xl font-black text-ink">changeme</p>
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900 ring-1 ring-amber-100">
              This is a visible demo placeholder. Real auth should store a hashed password and force a change from the
              default on first login.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-6">
          {setupSteps.map(([title, description], index) => (
            <WorkflowStep key={title} index={index + 1} title={title} description={description} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <Settings2 className="text-court-600" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">New tournament setup</p>
                <h2 className="text-3xl font-black text-ink">Start from defaults, then override anything.</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              {sportDefaults.map((defaults) => (
                <div key={defaults.sport} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={defaults.sport === tournament.sport ? 'success' : 'neutral'}>{defaults.sport}</StatusPill>
                    {defaults.formats.map((format) => (
                      <span key={format} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                        {format}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-500">Regular games</p>
                  <p className="mt-1 font-black text-ink">{defaults.regular}</p>
                  <p className="mt-4 text-sm font-bold text-slate-500">Playoffs</p>
                  <p className="mt-1 font-black text-ink">{defaults.playoffs}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <Users className="text-court-600" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Categories</p>
                <h2 className="text-3xl font-black text-ink">Pick divisions for this tournament.</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {divisionOptions.map((division) => {
                const enabled = tournament.divisions.includes(division)
                return (
                  <div key={division} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="font-black text-ink">{division}</p>
                    <StatusPill tone={enabled ? 'success' : 'neutral'}>{enabled ? 'Enabled' : 'Off'}</StatusPill>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="text-court-600" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Batch add teams and players</p>
                <h2 className="text-3xl font-black text-ink">CSV/XLSX import with column mapping.</h2>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              {importColumns.map((column) => (
                <div key={column.fileColumn} className="grid gap-3 border-b border-slate-200 p-4 last:border-b-0 md:grid-cols-[1fr_1fr_1fr]">
                  <p className="font-black text-ink">{column.fileColumn}</p>
                  <p className="rounded-full bg-court-50 px-3 py-1 text-sm font-bold text-court-700">maps to {column.mappedTo}</p>
                  <p className="text-sm text-slate-600">Sample: {column.sample}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <Pencil className="text-court-600" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Editable roster</p>
                <h2 className="text-3xl font-black text-ink">Fix names before scheduling.</h2>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {demoTeams.map((team) => (
                <div key={team.team} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-ink">{team.team}</p>
                    <StatusPill>Seed {team.seed}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm font-bold text-court-700">{team.division}</p>
                  <p className="mt-2 text-sm text-slate-600">{team.players}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-court-600" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Time and court setup</p>
                <h2 className="text-3xl font-black text-ink">Admin controls the court count.</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {[
                ['Tournament days', tournament.date],
                ['Time window', tournament.timeWindow],
                ['Courts', `${tournament.courts} courts`],
                ['Match duration', '35 minutes + 5 minute buffer'],
                ['Regular sets', tournament.regularFormat],
                ['Playoff sets', tournament.playoffFormat]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-2 font-black text-ink">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
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
            <div className="mt-6 rounded-2xl bg-court-600 p-5 text-white">
              <ShieldCheck />
              <p className="mt-3 font-black">When a match is submitted, scorekeepers lose edit access automatically.</p>
              <p className="mt-2 text-sm leading-6 text-court-50">
                Admin can reopen or correct a score only with a reason, so standings remain trustworthy.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
