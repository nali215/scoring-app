import { AppHeader } from '@/components/app-header'
import { StatusPill } from '@/components/status-pill'

export default function PublicTournamentPage({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-8">
        <StatusPill>Public tournament</StatusPill>
        <h1 className="mt-6 text-4xl font-black text-ink md:text-6xl">{params.slug.replaceAll('-', ' ')}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          Public schedules, live scores, standings, and brackets will render here when the admin enables public visibility.
        </p>
      </section>
    </main>
  )
}

