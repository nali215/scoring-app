import { doublesService, type ServiceStart, type Side } from './doubles-service'
import type { EventState, Match } from './event-types'
import type { GameSnapshot, ScoringRules } from './scoring/types'
import { finalizeIfWon } from './scoring/validation'
// Track physical right/left positions separately from the server's first/second turn.
export function pickleballService(start:ServiceStart,rallies:Side[],sideOutScoring=true){
 const other=(s:Side):Side=>s==='A'?'B':'A'
 const positions:Record<Side,[number,number]>={A:[0,1],B:[0,1]}
 positions[start.serving]=[start.server,1-start.server];positions[other(start.serving)]=[start.receiver,1-start.receiver]
 let serving=start.serving,server:number=start.server,serverNumber:1|2=sideOutScoring?2:1,first=sideOutScoring
 const score={A:0,B:0}
 for(const winner of rallies){
  if(!sideOutScoring){score[winner]++;positions[winner]=[positions[winner][1],positions[winner][0]];if(winner!==serving){serving=winner;server=positions[serving][0]}serverNumber=1;first=false;continue}
  if(winner===serving){score[winner]++;positions[serving]=[positions[serving][1],positions[serving][0]]}
  else if(first||serverNumber===2){serving=other(serving);server=positions[serving][0];serverNumber=1;first=false}
  else{server=1-server;serverNumber=2}
 }
 const idx=positions[serving].indexOf(server)
 return {serving,receiving:other(serving),server,receiver:positions[other(serving)][idx],court:idx===0?'right':'left',score,serverNumber,firstServerExceptionActive:first}
}
export function serviceFor(state:Pick<EventState,'settings'>,match:Match,index=match.games.length-1){return state.settings.sport==='pickleball'?pickleballService(match.starts[index],match.rallies[index],(match.sideOutScoring??state.settings.sideOutScoring)!==false):{...doublesService(match.starts[index],match.rallies[index]),serverNumber:null}}
export function pickleballSnapshot(start:ServiceStart,rallies:Side[],rules:ScoringRules):GameSnapshot{
 const s=pickleballService(start,rallies,rules.sideOutScoring)
 return finalizeIfWon({teamAScore:s.score.A,teamBScore:s.score.B,servingSide:s.serving,serverNumber:s.serverNumber,firstServerExceptionActive:s.firstServerExceptionActive,serviceSide:s.court as 'left'|'right',status:'in_progress',winnerSide:null},rules)
}

export function nextServingTeam(state:Pick<EventState,'settings'>,match:Match):Side { if(state.settings.sport!=='pickleball')return match.games.at(-1)!.winnerSide!;const first=match.starts[0].serving;return match.games.length%2===0?first:first==='A'?'B':'A' }
