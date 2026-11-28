import {eventCourts} from './event-types'
import type { EventState, Match, Slot, Team } from './event-types'

const roster = ['Javed/Shabnam','Arif/Aliza','Ronak/Suraiya','Adil/Sumaira','Imran/Rufi','Abeer/Shahila','Almir/Shabana','Arif/Saira','Adiyan/Arya','Zaid/Zahra','Hakim/Saina','Abid/Munira','Ayana/Zia']
// Court order, one row per 20-minute slot. An empty court is not a match.
const poolSchedule = [
 [[8,13],[9,12],[10,11]], [[1,6],[2,5],[3,4]],
 [[7,13],[8,11],[9,10]], [[1,5],[2,3],[4,6]],
 [[7,12],[8,9],[11,13]], [[1,4],[2,6],[3,5]],
 [[7,11],[9,13],[10,12]], [[1,3],[2,4],[5,6]],
 [[7,10],[8,12],null]
]

export function appendMixedDoubles(state: EventState, date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T12:00:00Z`))) throw new Error('A valid mixed doubles date is required.')
  if (state.teams.some(t => t.division === 'mixed')) throw new Error('Mixed Doubles is already present; do not import it twice.')
  if (state.settings.sport !== 'pickleball') throw new Error('Import Mixed Doubles into the pickleball event only.')
  if (!eventCourts(state).includes(3)) throw new Error('Configure three courts before importing the three-court schedule.')
  const identities = new Map<string, Set<string>>()
  for (const team of state.teams) for (let i=0;i<team.players.length;i++) {
    const label=(team.displayPlayers?.[i]??team.name.split('/')[i]??'').trim().toLowerCase()
    for (const alias of new Set([label,label.split(' ')[0]])) {
      if (!identities.has(alias)) identities.set(alias,new Set())
      identities.get(alias)!.add(team.players[i])
    }
  }
  const teams: Team[] = roster.map((name,i)=>({id:`mixed-${i+1}`,division:'mixed',name,pool:i<6?'A':'B',checkedIn:false,displayPlayers:name.split('/'),players:name.toLowerCase().split('/').map(p=>{
    const known=identities.get(p)
    return known?.size===1?[...known][0]:p==='arif'||p==='abid'?`${p} (mixed-${i+1})`:p
  })}))
  let number=Math.max(0,...state.matches.map(m=>m.number))
  const matches: Match[]=[]
  function add(round:Match['round'],court:number,time:string,a:Slot,b:Slot,pointsToWin:number,cap:number,bestOf:1|3,pool?:'A'|'B',poolRound?:number) {
    const m:Match={number:++number,division:'mixed',round,court,time,date,a,b,format:{pointsToWin,cap,bestOf,winBy:2},status:'Scheduled',games:[],rallies:[],starts:[],log:[],history:[],version:0,...(pool?{pool,poolRound}:{})}
    matches.push(m);return m.number
  }
  poolSchedule.forEach((courts,index)=>courts.forEach((pair,court)=>{
    if(!pair)return
    const mins=9*60+index*20,pool=pair[0]<=6?'A':'B',poolRound=Math.floor(index/2)+1
    add('Round robin',court+1,`${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`,{team:`mixed-${pair[0]}`},{team:`mixed-${pair[1]}`},11,17,1,pool,poolRound)
  }))
  const qf=[add('Quarterfinal',1,'12:20',{seed:1},{seed:8},15,21,1),add('Quarterfinal',2,'12:20',{seed:4},{seed:5},15,21,1),add('Quarterfinal',3,'12:20',{seed:3},{seed:6},15,21,1),add('Quarterfinal',1,'12:50',{seed:2},{seed:7},15,21,1)]
  const sf=[add('Semifinal',1,'13:40',{winner:qf[0]},{winner:qf[1]},11,17,3),add('Semifinal',2,'13:40',{winner:qf[2]},{winner:qf[3]},11,17,3)]
  add('Final',1,'15:00',{winner:sf[0]},{winner:sf[1]},11,17,3)
  state.teams.push(...teams);state.matches.push(...matches)
  state.settings.mixedDoubles={date,source:'URC Mix double Nov 2026.pdf'}
  state.settings.note+=` Mixed Doubles (${date}): pool play 9:00 AM, quarters 12:20 PM, semifinals 1:40 PM, final 3:00 PM. Planned times may shift around existing matches.`
  return state
}
