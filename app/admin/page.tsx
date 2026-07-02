import { CalendarDays, ClipboardList, Settings2, ShieldCheck, Users } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { CourtAccessManager } from '@/components/court-access-manager'
import { RosterManager } from '@/components/roster-manager'
import { StatusPill } from '@/components/status-pill'
import { WorkflowStep } from '@/components/workflow-step'
import { Button, Card, PageHeader, SectionHeader } from '@/components/ui'
import { adminScheduleActions, divisionOptions, setupSteps, sportDefaults } from '@/lib/app-data'

const correctionRules = [
  'Scorekeepers edit only their assigned live match.',
  'Submitting a final locks the match for scorekeepers.',
  'Only admins can reopen or correct a submitted score.',
  'Every correction is logged with a reason.'
]

export default function AdminPage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          title="Admin"
          subtitle="Create tournaments, import teams, build schedules, and control scoring."
          actions={
            <Button>
              <CalendarDays size={16} />
              New tournament
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {setupSteps.map(([title, description], index) => (
            <WorkflowStep key={title} index={index + 1} title={title} description={description} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <SectionHeader eyebrow="Setup" title="Sport defaults" icon={Settings2} />
            <div className="mt-5 space-y-3">
              {sportDefaults.map((defaults) => (
                <div key={defaults.sport} className="rounded-lg border border-line bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone="brand">{defaults.sport}</StatusPill>
                    {defaults.formats.map((format) => (
                      <span key={format} className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-line">
                        {format}
                      </span>
                    ))}
                  </div>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Regular</dt>
                      <dd className="mt-1 text-sm font-medium text-ink">{defaults.regular}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Playoffs</dt>
                      <dd className="mt-1 text-sm font-medium text-ink">{defaults.playoffs}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <SectionHeader eyebrow="Categories" title="Divisions" icon={Users} />
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {divisionOptions.map((division) => (
                <label
                  key={division}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-slate-50"
                >
                  {division}
                  <input type="checkbox" className="h-4 w-4 accent-brand-600" />
                </label>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <RosterManager />
        </div>

        <div className="mt-6">
          <CourtAccessManager />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="p-6">
            <SectionHeader eyebrow="Schedule" title="Court & match controls" icon={ClipboardList} />
            <div className="mt-5 rounded-lg border border-dashed border-line bg-slate-50/60 p-8 text-center">
              <p className="text-sm font-bold text-ink">No schedule generated yet</p>
              <p className="mt-1 text-sm text-slate-500">Import teams and pick a format to generate matches.</p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {adminScheduleActions.map((action) => (
                <div key={action} className="rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-medium text-slate-600">
                  {action}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <SectionHeader eyebrow="Score control" title="Submitted scores are protected" icon={ShieldCheck} />
            <ul className="mt-5 space-y-2">
              {correctionRules.map((rule) => (
                <li key={rule} className="flex gap-2 rounded-lg border border-line bg-slate-50/60 px-3 py-2 text-[13px] font-medium text-slate-600">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-brand-600" />
                  {rule}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </main>
  )
}
