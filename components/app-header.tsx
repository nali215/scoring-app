import Link from 'next/link'
import { clsx } from 'clsx'
import { LockKeyhole } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Tournaments' },
  { href: '/scorekeeper', label: 'Scorekeeper' },
  { href: '/display', label: 'Display' }
]

function BrandMark({ isDark }: { isDark: boolean }) {
  return (
    <Link href="/" className={clsx('flex items-center gap-2.5 font-bold tracking-tight', isDark ? 'text-white' : 'text-ink')}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 11.5 6 3l4 8.5M4 8.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="5" r="1.6" fill="currentColor" />
        </svg>
      </span>
      <span className="text-[15px]">Scoring</span>
    </Link>
  )
}

export function AppHeader({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark'

  return (
    <header
      className={clsx(
        'sticky top-0 z-30 border-b backdrop-blur',
        isDark ? 'border-white/10 bg-slate-950/80' : 'border-line bg-white/85'
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <BrandMark isDark={isDark} />
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isDark ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link
          href="/admin"
          className={clsx(
            'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
            isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-ink text-white hover:bg-ink/90'
          )}
        >
          <LockKeyhole size={15} />
          Admin
        </Link>
      </div>
    </header>
  )
}
