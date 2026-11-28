import {notFound,redirect} from 'next/navigation'
import {AppHeader} from '@/components/app-header'
import {CourtConsole} from '@/components/court-console'
import {isAdminAuthed,getScorerAuth} from '@/lib/auth'
import {eventCourts} from '@/lib/event-types'
import {readEvent} from '@/lib/event-store'
export const dynamic='force-dynamic'
export default async function CourtPage({params}:{params:Promise<{courtId:string}>}){
 const {courtId}=await params;const s=await readEvent(true);if(!eventCourts(s).includes(Number(courtId)) || String(Number(courtId))!==courtId)notFound()
 const admin=await isAdminAuthed(),scorer=await getScorerAuth()
 if(!admin){if(!scorer||String(scorer.court)!==courtId)redirect('/scorekeeper');if(!s.scorerEnabled[courtId]||s.courtSessions[courtId]!==scorer.session)redirect('/scorekeeper')}
 return <><AppHeader signedIn/><CourtConsole court={Number(courtId)}/></>
}
