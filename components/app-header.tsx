import Link from 'next/link'
import { SignOutButton } from './sign-out-button'
export function AppHeader({admin=false,signedIn=false,theme:_theme}:{admin?:boolean;signedIn?:boolean;theme?:'light'|'dark'}) {
  return <header className="site-header"><div className="site-nav"><Link className="site-brand" href="/"><span>URC</span><span>SOUTHWEST<small>BADMINTON 2026</small></span></Link><nav aria-label="Main navigation"><Link href="/">Tournament</Link><Link href="/scorekeeper">Scorekeeper</Link><Link href="/display">Display</Link></nav><div className="header-actions">{admin||signedIn?<SignOutButton/>:<Link href="/admin" className="btn nav-admin">Organizer</Link>}</div></div></header>
}
