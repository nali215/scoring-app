import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'URC Southwest | Badminton 2026', description: 'Tournament schedule, court scores and results for URC Southwest Badminton.', referrer: 'no-referrer' }
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html> }
