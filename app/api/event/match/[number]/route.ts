import {NextResponse} from 'next/server'
import {readEvent} from '@/lib/event-store'
import {isAdminAuthed,getScorerAuth} from '@/lib/auth'
export const dynamic='force-dynamic'
export async function GET(_request:Request,{params}:{params:Promise<{number:string}>}){
 const {number}=await params,state=await readEvent(),admin=await isAdminAuthed(),scorer=await getScorerAuth()
 if(!state.published&&!admin&&!(scorer&&state.scorerEnabled[String(scorer.court)]&&state.courtSessions[String(scorer.court)]===scorer.session))return NextResponse.json({error:'Tournament is not published.'},{status:403})
 const match=state.matches.find(m=>m.number===Number(number));if(!match)return NextResponse.json({error:'Match not found.'},{status:404})
 return NextResponse.json({match:{...match,history:[]},teams:state.teams},{headers:{'Cache-Control':'no-store'}})
}
