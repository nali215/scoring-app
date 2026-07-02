export function WorkflowStep({
  index,
  title,
  description,
  state = 'Ready'
}: {
  index: number
  title: string
  description: string
  state?: string
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink font-black text-white">
          {index}
        </div>
        <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-court-700">
          {state}
        </span>
      </div>
      <h3 className="mt-6 text-lg font-black text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

