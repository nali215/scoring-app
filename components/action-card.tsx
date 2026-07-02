import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export function ActionCard({
  href,
  title,
  description,
  cta,
  Icon
}: {
  href: string
  title: string
  description: string
  cta: string
  Icon: LucideIcon
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-panel"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-court-50 text-court-700 ring-1 ring-court-100">
        <Icon size={22} />
      </div>
      <h3 className="mt-6 text-xl font-black text-ink">{title}</h3>
      <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">{description}</p>
      <p className="mt-6 text-sm font-bold text-court-700 group-hover:text-court-600">{cta} →</p>
    </Link>
  )
}

