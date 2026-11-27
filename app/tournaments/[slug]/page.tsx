import { notFound, redirect } from 'next/navigation'
export default async function TournamentPage({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; if(!['urc-2026','urc-pickleball-2026'].includes(slug))notFound();redirect('/') }
