import { notFound, redirect } from 'next/navigation'
export default async function TournamentPage({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; if(slug!=='urc-2026')notFound();redirect('/') }
