import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, SCORER_COOKIE, scorerToken, verifyScorerPassword } from '@/lib/auth'
import { checkScorerPassword } from '@/lib/scorer-credentials'
import { eventCourts } from '@/lib/event-types'
import { isSameOrigin } from '@/lib/request-origin'
import { mutateEvent } from '@/lib/event-store'
import { EventError } from '@/lib/event-engine'
export const dynamic='force-dynamic'
export async function POST(request:Request) {
  if(!isSameOrigin(request))return NextResponse.json({error:'Cross-site request rejected.'},{status:403})
  try {
    const raw=await request.text()
    if(raw.length>2000)return NextResponse.json({error:'Sign-in request too large.'},{status:413})
    const body=JSON.parse(raw), username=String(body.username??'').toLowerCase().trim(), password=String(body.password??'')
    if(username.length>40||password.length>128)throw new EventError('Incorrect username or password.',401)
    const session=randomUUID()
    let court=0
    await mutateEvent(s=>{
      court=eventCourts(s).find(n=>(s.scorerAccounts?.[String(n)]?.username??`court${n}`)===username)??0
      const account=s.scorerAccounts?.[String(court)]
      if(!court || !(account?checkScorerPassword(password,account.passwordHash):verifyScorerPassword(court,password)))throw new EventError('Incorrect username or password.',401)
      if(!s.scorerEnabled[String(court)])throw new EventError('This court account is disabled. Contact the organizer.',403)
      s.courtSessions[String(court)]=session;s.version++;s.updatedAt=new Date().toISOString()
      s.audit.push({at:s.updatedAt,actor:username,action:'signIn',detail:`Court ${court} scoring session transferred to this device`})
      return s
    })
    const response=NextResponse.json({court})
    response.cookies.set(SCORER_COOKIE,scorerToken(court,session),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:12*60*60})
    response.cookies.delete(ADMIN_COOKIE)
    return response
  }catch(error){
    if(error instanceof EventError && error.status===401)await new Promise(resolve=>setTimeout(resolve,800))
    return NextResponse.json({error:error instanceof EventError?error.message:'Unable to sign in. Please try again.'},{status:error instanceof EventError?error.status:503})
  }
}
