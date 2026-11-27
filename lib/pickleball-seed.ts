import type { EventState, Match, Team, Slot, Division } from './event-types'
const adult = ['Joheb/Akash','Abid/Zainul','Parvez/Arif','Arij/Rayan','Rizwan/Irfan','Abeer/Anif','Samir/Zavian','Ronak/Imran','Aziz/Renish','Aadil/Aamir','Sohil/Shakil','Javed/Ayaan','Izaan/Nehan','Hakim/Arif','Saffan/Arif','Tahsin/Nuresh','Abid/Riyaz','Shakeel/Aaijaj']
const juniors = [
 ['Adiyan Momin','Ariyan Momin'],['Arya Manasiya','Zia Sunesra'],['Aziq Mohammed','Zayan Prasla'],['Zidan Sunesara','Zoysh Karedia'],['Afi Samnani','Zidan Momin']
]
export function createPickleballEvent(): EventState {
 const teams: Team[] = adult.map((name,i)=>({id:`adult-${i+1}`,division:'adult',name,players:name.toLowerCase().split('/').map(p=>['arif','abid'].includes(p)?`${p} (${i+1})`:p),displayPlayers:name.split('/'),checkedIn:false}))
 teams.push(...juniors.map((players,i)=>({id:`junior-${i+1}`,division:'junior' as const,name:players.join('/'),players:players.map(p=>p.toLowerCase()),displayPlayers:players,checkedIn:false})))
 const matches:Match[]=[]
 function add(division:Division,round:Match['round'],court:number,time:string,date:string,a:Slot,b:Slot,pointsToWin:number,bestOf:1|3){const m:Match={number:matches.length+1,division,round,court,time,date,a,b,format:{pointsToWin,bestOf},games:[],rallies:[],starts:[],log:[],status:'Scheduled',version:0,history:[]};matches.push(m);return m.number}
 const jleft=[[1,2],[2,3],[4,5],[3,5],[1,4]],jright=[[3,4],[5,1],[1,3],[2,4],[5,2]]
 for(let i=0;i<5;i++)for(const court of [1,2]){const [a,b]=(court===1?jleft:jright)[i];add('junior','Round robin',court,`1${Math.floor(i/3)}:${String((i%3)*20).padStart(2,'0')}`,'2026-11-28',{team:`junior-${a}`},{team:`junior-${b}`},11,1)}
 const left=[[1,2],[3,4],[5,6],[7,8],[9,10],[2,12],[4,14],[6,16],[8,18],[10,2],[12,4],[14,6],[16,8],[18,10]]
 const right=[[11,12],[13,14],[15,16],[17,18],[1,11],[3,13],[5,15],[7,17],[9,1],[11,3],[13,5],[15,7],[17,9]]
 for(let i=0;i<14;i++)for(const court of [1,2]){const pair=(court===1?left:right)[i];if(!pair)continue;const [a,b]=pair;const mins=12*60+i*20;add('adult','Round robin',court,`${Math.floor(mins/60)}:${String(mins%60).padStart(2,'0')}`,'2026-11-28',{team:`adult-${a}`},{team:`adult-${b}`},11,1)}
 const r16:number[]=[]
 for(let i=0;i<8;i++){const mins=10*60+Math.floor(i/2)*20;r16.push(add('adult','Round of 16',i%2+1,`${Math.floor(mins/60)}:${String(mins%60).padStart(2,'0')}`,'2026-11-29',{seed:i+1},{seed:16-i},15,1))}
 const qf:number[]=[]
 for(const [i,[a,b]]of [[0,7],[1,6],[2,5],[3,4]].entries())qf.push(add('adult','Quarterfinal',i%2+1,i<2?'11:30':'12:00','2026-11-29',{winner:r16[a]},{winner:r16[b]},15,1))
 const jsf=[add('junior','Semifinal',1,'12:30','2026-11-29',{seed:1},{seed:4},11,3),add('junior','Semifinal',2,'12:30','2026-11-29',{seed:2},{seed:3},11,3)]
 const asf=[add('adult','Semifinal',1,'13:30','2026-11-29',{winner:qf[0]},{winner:qf[3]},11,3),add('adult','Semifinal',2,'13:30','2026-11-29',{winner:qf[1]},{winner:qf[2]},11,3)]
 add('junior','Final',1,'13:30','2026-11-29',{winner:jsf[0]},{winner:jsf[1]},11,3)
 add('adult','Final',1,'15:00','2026-11-29',{winner:asf[0]},{winner:asf[1]},11,3)
 return {schema:1,version:1,updatedAt:new Date().toISOString(),published:false,settings:{name:'URC Games 2026 Pickleball Tournament',date:'2026-11-28',endDate:'2026-11-29',venue:'Unity Recreation Center',timezone:'America/Chicago',note:'Saturday: junior check-in 9:30 AM, first serve 10:00 AM; adults start noon. Sunday playoffs start 10:00 AM. Junior final 1:30 PM, adult final 3:00 PM. Planned times may shift as courts become available.',winBy:2,cap:0,reviewed:false,sport:'pickleball',sideOutScoring:true,courtCount:3},teams,matches,seeds:{},courtSessions:{},scorerNames:{'1':'Court 1 scorer','2':'Court 2 scorer','3':'Court 3 scorer'},scorerEnabled:{'1':true,'2':true,'3':true},coinTosses:[],audit:[],requests:[]}
}
