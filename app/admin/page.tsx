import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'

const setupSteps = [
  ['Tournament profile', 'Venue, sport, divisions, public visibility'],
  ['Teams and players', 'Manual entry or validated CSV/XLSX import'],
  ['Rules lock', 'Pickleball or badminton presets with division overrides'],
  ['Schedule generation', 'Courts, pools, brackets, BYEs, and feeder slots'],
  ['Operations', 'Scorekeeper assignment, display devices, audit log']
]

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <div className="rounded-[2rem] bg-ink p-8 text-white shadow-panel">
          <StatusPill tone="success">Admin command center</StatusPill>
          <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">Build, lock, and operate the tournament.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            This area will become the dense operational surface for setup, imports, rules, schedules, corrections, and
            audit history. Mutations will be enforced server-side by role.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          {setupSteps.map(([title, description], index) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-court-100 font-black text-court-700">
                {index + 1}
              </div>
              <h2 className="mt-5 font-bold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

