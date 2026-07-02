import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AdminLoginForm } from '@/components/admin-login-form'
import { isAdminAuthed, usingDefaultPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  if (await isAdminAuthed()) {
    redirect('/admin')
  }

  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink">
          <ArrowLeft size={15} />
          Back to tournaments
        </Link>

        <div className="rounded-xl border border-line bg-white p-6 shadow-card sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600 text-white">
            <ShieldCheck size={20} />
          </span>
          <h1 className="mt-5 text-xl font-bold tracking-tight text-ink">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-500">
            Admin controls tournaments, rosters, schedules, and scoring corrections.
          </p>

          <div className="mt-6">
            <AdminLoginForm />
          </div>

          {usingDefaultPassword() ? (
            <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">
              <strong>Default password:</strong> <code className="rounded bg-white px-1 py-0.5 font-mono">changeme</code>. Set{' '}
              <code className="rounded bg-white px-1 py-0.5 font-mono">ADMIN_PASSWORD</code> in your Vercel project to change it.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  )
}
