import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, SCORER_COOKIE, scorerToken, verifyScorerPassword } from '@/lib/auth'
import { isSameOrigin } from '@/lib/request-origin'
import { mutateEvent } from '@/lib/event-store'
import { EventError } from '@/lib/event-engine'
export const dynamic='force-dynamic'
export async function POST(request:Request) {
  if(!isSameOrigin(request))return NextResponse.json({error:'Cross-site request rejected.'},{status:403})
  try {
    const body=await request.json(), court=Number(/^court([123])$/.exec(String(body.username??'').toLowerCase().trim())?.[1])
    if(!verifyScorerPassword(court,String(body.password??''))) {
      await new Promise(resolve=>setTimeout(resolve,800))
      return NextResponse.json({error:'Incorrect username or password.'},{status:401})
    }
    const session=randomUUID()
    await mutateEvent(s=>{
      if(!s.scorerEnabled[String(court)])throw new EventError('This court account is disabled. Contact the organizer.',403)
      s.courtSessions[String(court)]=session;s.version++;s.updatedAt=new Date().toISOString()
      s.audit.push({at:s.updatedAt,actor:`court${court}`,action:'signIn',detail:'Scoring session transferred to this device'})
      return s
    })
    const response=NextResponse.json({court})
    response.cookies.set(SCORER_COOKIE,scorerToken(court,session),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:12*60*60})
    response.cookies.delete(ADMIN_COOKIE)
    return response
  }catch(error){return NextResponse.json({error:error instanceof EventError?error.message:'Unable to sign in. Please try again.'},{status:error instanceof EventError?error.status:503})}
}
