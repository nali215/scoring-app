import Link from 'next/link'
import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'

export function cn(...args: Parameters<typeof clsx>) {
  return clsx(...args)
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white hover:bg-ink/90',
  secondary: 'border border-line bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-sm'
}

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variantClass[variant], sizeClass[size], className)
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClass(variant, size, className)} {...props} />
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  href,
  children
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  href: string
  children: React.ReactNode
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  )
}

export function Card({
  className,
  children,
  as: Tag = 'div'
}: {
  className?: string
  children: React.ReactNode
  as?: 'div' | 'section' | 'article'
}) {
  return <Tag className={cn('rounded-xl border border-line bg-white shadow-card', className)}>{children}</Tag>
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700', className)}>{children}</p>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action
}: {
  eyebrow?: string
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
            <Icon size={18} />
          </span>
        ) : null}
        <div>
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export const inputClass =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'

export const fieldLabelClass = 'grid gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500'
