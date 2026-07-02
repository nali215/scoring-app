import { LiveDisplay } from '@/components/live-display'
import { getLiveState } from '@/lib/live-state'

export default function DisplayPage() {
  const initialState = getLiveState()

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col border border-white/10 bg-slate-950 p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-2xl font-bold text-court-500">Tournament display</p>
            <h1 className="mt-2 text-6xl font-black tracking-tight">Live Courts</h1>
            <p className="mt-2 text-xl font-semibold text-slate-300">Waiting for published court assignments</p>
          </div>
          <p className="bg-court-500 px-6 py-3 text-2xl font-black text-black">LIVE</p>
        </div>

        <LiveDisplay initialState={initialState} courts={8} />
      </section>
    </main>
  )
}

