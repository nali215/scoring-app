import { CalendarDays, Settings2, ShieldCheck, Users } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { CourtAccessManager } from '@/components/court-access-manager'
import { RosterManager } from '@/components/roster-manager'
import { StatusPill } from '@/components/status-pill'
import { WorkflowStep } from '@/components/workflow-step'
import { adminScheduleActions, divisionOptions, setupSteps, sportDefaults } from '@/lib/app-data'

const correctionRules = [
  'Scorekeepers can edit only assigned live matches.',
  'Final submit locks the match for scorekeepers.',
  'Only admins can reopen or correct submitted scores.',
  'Every admin correction requires a reason and audit entry.'
]

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f3f5f8]">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6">
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Admin</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Create tournaments, import teams, build schedules, and control scoring.</p>
          </div>
          <button className="inline-flex items-center gap-2 bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm">
            <CalendarDays size={16} />
            New tournament
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-6">
          {setupSteps.map(([title, description], index) => (
            <WorkflowStep key={title} index={index + 1} title={title} description={description} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Settings2 className="text-court-600" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Tournament setup</p>
                <h2 className="text-2xl font-black text-slate-950">Sport defaults</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4">
              {sportDefaults.map((defaults) => (
                <div key={defaults.sport} className="border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill>{defaults.sport}</StatusPill>
                    {defaults.formats.map((format) => (
                      <span key={format} className="bg-white px-3 py-1 text-xs font-bold text-slate-600">
                        {format}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-500">Regular games</p>
                  <p className="mt-1 font-black text-slate-950">{defaults.regular}</p>
                  <p className="mt-4 text-sm font-bold text-slate-500">Playoffs</p>
                  <p className="mt-1 font-black text-slate-950">{defaults.playoffs}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="text-court-600" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Divisions</p>
                <h2 className="text-2xl font-black text-slate-950">Available categories</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {divisionOptions.map((division) => (
                <label key={division} className="flex items-center justify-between border border-slate-200 bg-slate-50 p-4">
                  <span className="font-black text-slate-950">{division}</span>
                  <input type="checkbox" className="h-5 w-5 accent-slate-950" />
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6">
          <RosterManager />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-court-600" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Schedule editor</p>
                <h2 className="text-2xl font-black text-slate-950">Court and match controls</h2>
              </div>
            </div>
            <div className="mt-5 border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="font-black text-slate-950">No schedule generated</p>
              <p className="mt-1 text-sm text-slate-500">Schedule rows will appear here after teams are imported and a format is selected.</p>
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Allowed changes</p>
            <div className="mt-5 space-y-2">
              {adminScheduleActions.map((action) => (
                <div key={action} className="border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  {action}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6">
          <CourtAccessManager />
        </div>

        <div className="mt-6 border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-court-700">Score control policy</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Live phones are fast; submitted scores are protected.</h2>
            </div>
            <StatusPill tone="success">Admin-only corrections</StatusPill>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {correctionRules.map((rule) => (
              <div key={rule} className="border border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-700">
                {rule}
              </div>
            ))}
          </div>
          <div className="mt-5 bg-court-600 p-5 text-white">
            <ShieldCheck />
            <p className="mt-3 font-black">When a match is submitted, scorekeepers lose edit access automatically.</p>
            <p className="mt-2 text-sm leading-6 text-court-50">
              Admin can reopen or correct a score only with a reason, so standings remain trustworthy.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
