import {AppHeader} from '@/components/app-header'
import {MatchDetail} from '@/components/match-detail'
import {notFound} from 'next/navigation'
export default async function MatchPage({params}:{params:Promise<{number:string}>}){const {number}=await params;const n=Number(number);if(!Number.isInteger(n)||n<1||n>53)notFound();return <><AppHeader/><MatchDetail number={n}/></>}
