import { clsx } from 'clsx'

type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand'

const toneClass: Record<StatusTone, string> = {
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200'
}

export function StatusPill({
  children,
  tone = 'neutral',
  dot = false
}: {
  children: React.ReactNode
  tone?: StatusTone
  dot?: boolean
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1',
        toneClass[tone]
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  )
}
