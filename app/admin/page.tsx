import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { EventDashboard } from '@/components/event-dashboard'
import { isAdminAuthed } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export default async function AdminPage() {
  if (!(await isAdminAuthed())) redirect('/admin/login')
  return <><AppHeader admin/><EventDashboard admin/></>
}
