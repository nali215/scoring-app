import { AlertTriangle, BookOpen } from 'lucide-react'
import { Card, Eyebrow } from '@/components/ui'
import { sportDefaults } from '@/lib/app-data'

const steps: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Create the tournament and pick divisions',
    body: (
      <>Set the name, venue, sport, and dates, then enable only the divisions you are running (below under Divisions).</>
    )
  },
  {
    title: '2. Collect entries with a Google Form (optional)',
    body: (
      <>
        Make a Google Form with columns like <em>Division, Player 1 First/Last, Partner First/Last, Email, Seed</em>. Responses
        land in a Google Sheet automatically.
      </>
    )
  },
  {
    title: '3. Import the roster',
    body: (
      <>
        In Google Sheets choose <strong>File → Download → CSV</strong> (or Excel <strong>.xlsx</strong>) and upload it under{' '}
        <strong>Teams &amp; players</strong>. Columns auto-map — adjust any that are wrong, check the New/Update preview, then
        Import. Re-upload the same sheet anytime to update existing teams.
      </>
    )
  },
  {
    title: '4. Configure formats and generate the schedule',
    body: <>Choose regular and playoff formats, number of courts, and time blocks, then generate the match schedule.</>
  },
  {
    title: '5. Send each court a scorekeeper link',
    body: (
      <>
        Under <strong>Scorekeeper access</strong> every court has its own link. Text, email, or share it — whoever opens it
        scores only that court. No accounts needed. Regenerate a court&apos;s code to revoke the old link.
      </>
    )
  },
  {
    title: '6. Run scoring',
    body: (
      <>
        Scorekeepers tap the side that won each rally. Scores update live on the public page and the Display board. Submitting a
        final <strong>locks the match</strong> (only admin can correct it) and advances the court to its next match.
      </>
    )
  },
  {
    title: '7. Publish and share',
    body: (
      <>
        The public tournament page shows <strong>Games</strong>, <strong>Standings</strong>, and <strong>Schedule</strong> with
        no login. Share that link with players and spectators.
      </>
    )
  }
]

export function AdminGuide() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line p-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <BookOpen size={18} />
        </span>
        <div>
          <Eyebrow>Documentation</Eyebrow>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">How to run a tournament</h2>
        </div>
      </div>

      <ol className="divide-y divide-line">
        {steps.map((step) => (
          <li key={step.title} className="px-6 py-4">
            <p className="text-sm font-bold text-ink">{step.title}</p>
            <p className="mt-1 text-[13px] leading-6 text-slate-600">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="border-t border-line p-6">
        <Eyebrow>Reference — scoring formats</Eyebrow>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2 pr-4 font-semibold">Sport</th>
                <th className="pb-2 pr-4 font-semibold">Regular games</th>
                <th className="pb-2 font-semibold">Playoffs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sportDefaults.map((sport) => (
                <tr key={sport.sport}>
                  <td className="py-2.5 pr-4 font-bold text-ink">{sport.sport}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{sport.regular}</td>
                  <td className="py-2.5 text-slate-600">{sport.playoffs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 border-t border-line bg-amber-50/60 px-6 py-4">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-[13px] leading-6 text-amber-900">
          <strong>Storage note:</strong> until a database is connected, teams and scores are held in temporary server memory and
          can reset on redeploy. Connect Postgres (Neon) to make everything persist for real events.
        </p>
      </div>
    </Card>
  )
}
