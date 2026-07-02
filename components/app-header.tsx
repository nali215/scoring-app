import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/tournaments', label: 'Public view' },
  { href: '/admin', label: 'Admin' },
  { href: '/scorekeeper', label: 'Scorekeeper' },
  { href: '/display', label: 'Display' }
]

export function AppHeader({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark'

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
      <Link href="/" className={clsx('flex items-center gap-3 font-semibold', isDark ? 'text-white' : 'text-ink')}>
        <span className={clsx('flex h-10 w-10 items-center justify-center rounded-2xl', isDark ? 'bg-white text-ink' : 'bg-ink text-white')}>
          <Trophy size={20} />
        </span>
        <span>Scoring App</span>
      </Link>
      <nav
        className={clsx(
          'hidden items-center gap-2 rounded-full border p-1 shadow-sm md:flex',
          isDark ? 'border-white/10 bg-white/10' : 'border-slate-200 bg-white'
        )}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'rounded-full px-4 py-2 text-sm font-medium',
              isDark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
