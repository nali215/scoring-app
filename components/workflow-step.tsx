export function WorkflowStep({
  index,
  title,
  description
}: {
  index: number
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-card">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
        {index}
      </span>
      <h3 className="mt-4 text-sm font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-5 text-slate-500">{description}</p>
    </div>
  )
}
