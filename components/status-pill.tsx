import { clsx } from 'clsx'

type StatusTone = 'neutral' | 'success' | 'warning' | 'danger'

const toneClass: Record<StatusTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200'
}

export function StatusPill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: StatusTone }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1', toneClass[tone])}>
      {children}
    </span>
  )
}

