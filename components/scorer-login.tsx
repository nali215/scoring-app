'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
export function ScorerLogin() {
 const router=useRouter(),[username,setUsername]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[pending,setPending]=useState(false)
 return <form className="scorer-login" onSubmit={async e=>{e.preventDefault();setPending(true);setError('');try{const r=await fetch('/api/scorer/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});const data=await r.json();if(!r.ok)throw new Error(data.error);router.push('/scorekeeper/court/'+data.court);router.refresh()}catch(cause){setError(cause instanceof Error?cause.message:'Sign-in failed.');setPending(false)}}}>
 <label>Username<input autoComplete="username" autoCapitalize="none" autoCorrect="off" value={username} onChange={e=>setUsername(e.target.value)} placeholder="court1, court2, or court3" required/></label>
 <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<div className="notice error" role="alert">{error}</div>}
 <button className="btn gold full-width" disabled={pending}>{pending?'Signing in…':'Sign in to score'}</button><p className="helper">Signing in transfers this court’s scoring session to this device. Viewers do not need an account.</p></form>
}
