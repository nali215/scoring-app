import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { AdminLoginForm } from '@/components/admin-login-form'
import { isAdminAuthed, usingDefaultPassword } from '@/lib/auth'
export const dynamic='force-dynamic'
export default async function LoginPage() {
  if(await isAdminAuthed())redirect('/admin')
  return <><AppHeader/><main className="login-container"><div className="admin-panel"><span className="eyebrow">ORGANIZER ACCESS</span><h1>Welcome back.</h1><p className="muted">Manage teams, courts, and results for URC Southwest.</p>{usingDefaultPassword()?<div className="notice">Organizer access has not been configured. Run the local setup command or configure the hosting environment.</div>:<AdminLoginForm/>}</div></main></>
}
