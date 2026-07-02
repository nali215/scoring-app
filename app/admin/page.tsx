import { redirect } from 'next/navigation'
import { CalendarDays, Users } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AdminGuide } from '@/components/admin-guide'
import { CourtAccessManager } from '@/components/court-access-manager'
import { RosterManager } from '@/components/roster-manager'
import { SignOutButton } from '@/components/sign-out-button'
import { Button, Card, PageHeader, SectionHeader } from '@/components/ui'
import { divisionOptions } from '@/lib/app-data'
import { isAdminAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!(await isAdminAuthed())) {
    redirect('/admin/login')
  }

  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader
          title="Admin"
          subtitle="Create tournaments, import teams, build schedules, and control scoring."
          actions={
            <>
              <Button>
                <CalendarDays size={16} />
                New tournament
              </Button>
              <SignOutButton />
            </>
          }
        />

        <AdminGuide />

        <div className="mt-6">
          <Card className="p-6">
            <SectionHeader eyebrow="Categories" title="Divisions" description="Enable only the divisions for this tournament." icon={Users} />
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>
    </main>
  )
}
