import { hashScorerPassword } from './scorer-credentials'
import { z } from 'zod'
import { awardBadmintonRally, createBadmintonGame } from './scoring/badminton'
import { gameWinner, finalizeIfWon, matchWinner } from './scoring/validation'
import type { GameSnapshot, ScoringRules } from './scoring/types'
import { type EventState, type Match, type Division, playerName, type ScoreBaseline, eventCourts, MAX_COURTS } from './event-types'
import { serviceFor, pickleballSnapshot, nextServingTeam } from './event-service'

const division = z.enum(['men', 'mixed', 'legends','adult','junior'])
const time = z.string().regex(/^(TBA|([01]\d|2[0-3]):[0-5]\d)$/)
const common = { requestId: z.string().uuid(), version: z.number().int().nonnegative() }
const matchFields = { ...common, match: z.number().int().min(1).max(999) }
const username = z.string().trim().toLowerCase().min(3).max(40).regex(/^[a-z0-9][a-z0-9_.-]*$/, 'Use letters, numbers, dots, underscores or hyphens for the username.')
const password = z.string().min(6).max(128)
const manualService = z.object({serving:z.enum(['A','B']),server:z.union([z.literal(0),z.literal(1)]),receiver:z.union([z.literal(0),z.literal(1)]),court:z.enum(['left','right']),serverNumber:z.union([z.literal(1),z.literal(2)]),openingServe:z.boolean()})
const firstPlayers = { server: z.union([z.literal(0),z.literal(1)]).default(0), receiver: z.union([z.literal(0),z.literal(1)]).default(0) }
export const actionSchema = z.discriminatedUnion('action', [
  z.object({ ...matchFields, ...firstPlayers, action: z.literal('start'), coinTossWinner: z.enum(['A', 'B']), court: z.number().int().min(1).max(MAX_COURTS).optional(), serving: z.enum(['A', 'B']).default('A') }),
  z.object({ ...matchFields, action: z.literal('point'), side: z.enum(['A', 'B']) }),
  z.object({ ...matchFields, action: z.literal('removePoint'), side: z.enum(['A', 'B']) }),
  z.object({ ...matchFields, ...firstPlayers, action: z.literal('nextGame'), serving:z.enum(['A','B']).optional() }),
  z.object({ ...matchFields, action: z.literal('submit') }),
  z.object({ ...matchFields, action: z.literal('cancelMatch') }),
  z.object({ ...common, action: z.literal('resetDemo'), confirmation: z.literal('RESET DEMO') }),
  z.object({ ...matchFields, action: z.literal('reopen'), reason: z.string().trim().min(5).max(300) }),
  z.object({ ...matchFields, action: z.literal('manualScore'), mode:z.enum(['final','live']), games:z.array(z.object({a:z.number().int().min(0).max(999),b:z.number().int().min(0).max(999)})).min(1).max(3),service:manualService.optional(),preserveSeeds:z.boolean().default(false),reason:z.string().trim().min(5).max(300) }),
  z.object({ ...matchFields, action: z.literal('schedule'), date: z.string().date().optional(), court: z.number().int().min(1).max(MAX_COURTS), time }),
  z.object({ ...common, action: z.literal('settings'), settings: z.object({ sideOutScoring: z.boolean().optional(), name: z.string().trim().min(3).max(100), date: z.string().date(), venue: z.string().trim().max(200), note: z.string().trim().max(1000), winBy: z.number().int().min(1).max(2), cap: z.number().int().min(0).max(50), reviewed: z.boolean() }) }),
  z.object({ ...common, action: z.literal('publish'), published: z.boolean() }),
  z.object({ ...common, action: z.literal('team'), id: z.string().max(40), name: z.string().trim().min(3).max(100), players: z.array(z.string().trim().min(1).max(80)).length(2), checkedIn: z.boolean() }),
  z.object({ ...common, action: z.literal('seed'), division, overrideReason: z.string().trim().min(5).max(300).optional(), order: z.array(z.string().max(40)).min(3).max(64) }),
  z.object({ ...common, action: z.literal('clearSeeds'), division }),
  z.object({ ...common, action: z.literal('coinToss'), division, teams: z.array(z.string().max(40)).min(2).max(64), winner: z.string().max(40), note: z.string().trim().max(300).default('') }),
  z.object({ ...common, action: z.literal('scorer'), court: z.number().int().min(1).max(MAX_COURTS), name: z.string().trim().min(1).max(80), enabled: z.boolean() }),
  z.object({ ...common, action: z.literal('addCourt'), username, password }),
  z.object({ ...common, action: z.literal('scorerAccount'), court: z.number().int().min(1).max(MAX_COURTS), username, password: password.optional() }),
  z.object({ ...common, action: z.literal('releaseScorer'), court: z.number().int().min(1).max(MAX_COURTS) })
])
export type EventAction = z.infer<typeof actionSchema>
export type Actor = { admin: true } | { admin: false; court: number; session: string }
export class EventError extends Error { constructor(message: string, public status = 400) { super(message) } }
function requireThat(condition: unknown, message: string, status = 400): asserts condition { if (!condition) throw new EventError(message, status) }

export function rulesFor(state: EventState, match: Match): ScoringRules {
  return { sport: state.settings.sport??'badminton', pointsToWin: match.format?.pointsToWin??21, winBy: match.format?.winBy??state.settings.winBy, pointCap: (match.format?.cap??state.settings.cap)||undefined, bestOf: match.format?.bestOf??(match.round === 'Round robin' ? 1 : 3), doubles: true, sideOutScoring: state.settings.sport==='pickleball'&&(match.sideOutScoring??state.settings.sideOutScoring)!==false, showServerNumber: state.settings.sport==='pickleball' }
}
function winnerSide(state: EventState, match: Match) {
  return matchWinner(match.games.flatMap(g => g.winnerSide ? [g.winnerSide] : []), rulesFor(state, match))
}
function playerIds(state: EventState, match: Match) {
  return state.teams.filter(t => t.id === match.a.team || t.id === match.b.team).flatMap(t => t.players.map(p => p.trim().toLowerCase()))
}
export function scheduleConflicts(state: EventState) {
  const issues: string[] = []
  const timed = state.matches.filter(m => m.time !== 'TBA')
  const minute = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3))
  for (let i = 0; i < timed.length; i++) for (let j = i + 1; j < timed.length; j++) {
    const a = timed[i], b = timed[j]
    if ((a.date??state.settings.date)!==(b.date??state.settings.date)) continue
    if (minute(a.time) >= minute(b.time) + (b.round === 'Round robin' ? 20 : 40) || minute(b.time) >= minute(a.time) + (a.round === 'Round robin' ? 20 : 40)) continue
    if (a.court === b.court) issues.push(`Matches #${a.number} and #${b.number} overlap on Court ${a.court}.`)
    else if (playerIds(state, a).some(p => playerIds(state, b).includes(p))) issues.push(`Matches #${a.number} and #${b.number} share a player at overlapping times.`)
  }
  return issues
}
export function resolveSlots(state: EventState) {
  for (const m of state.matches) for (const slot of [m.a, m.b]) {
    if (slot.seed) slot.team = state.seeds[m.division]?.[slot.seed - 1]
    if (slot.winner) slot.team = state.matches.find(p => p.number === slot.winner)?.winner
  }
}
function descendants(state: EventState, number: number): Match[] {
  const direct = state.matches.filter(m => m.a.winner === number || m.b.winner === number)
  return direct.flatMap(m => [m, ...descendants(state, m.number)])
}
function unstartedKnockouts(state: EventState, division: Division) {
  requireThat(!state.matches.some(m => m.division === division && m.round !== 'Round robin' && m.status !== 'Scheduled'), 'Knockouts have started. Their seed order is locked.')
}

// Runs inside the storage transaction. No client-supplied status, score, winner, or court authority is trusted.
export function applyEventAction(state: EventState, action: EventAction, actor: Actor): EventState {
  if (!actor.admin) requireThat(eventCourts(state).includes(actor.court) && state.scorerEnabled[String(actor.court)] && state.courtSessions[String(actor.court)] && state.courtSessions[String(actor.court)] === actor.session, 'Scoring session ended. Sign in again or ask the organizer to enable this account.', 403)
  const requestKey = `${actor.admin ? 'admin' : actor.court}:${action.requestId}`
  if (state.requests.includes(requestKey)) return state
  const scoreActions = ['start', 'point', 'removePoint', 'nextGame', 'submit', 'cancelMatch']
  if (!scoreActions.includes(action.action)) requireThat(actor.admin, 'Administrator access required.', 403)
  let detail = ''
  if ('match' in action) {
    const match = state.matches.find(m => m.number === action.match)
    requireThat(match, 'Match not found.', 404)
    requireThat(actor.admin || actor.court === match.court || (action.action === 'start' && match.status === 'Scheduled'), 'This account can score only matches playing on its court.', 403)
    requireThat(match.version === action.version, 'This match changed on another device. Review the latest score and try again.', 409)
    const oldGameIndex=match.games.length-1
    const beforeService=oldGameIndex>=0?serviceFor(state,match,oldGameIndex):null
    if (scoreActions.includes(action.action)) requireThat(state.published, 'Publish the tournament before scoring.')
    if (action.action === 'manualScore') {
      requireThat(match.a.team && match.b.team, 'Assign both teams by confirming seeds or completing preceding matches first.')
      requireThat(action.mode==='final'||state.settings.sport==='pickleball', 'Current-score entry is available for pickleball.')
      const candidate={...match,sideOutScoring:match.sideOutScoring??state.settings.sideOutScoring!==false}
      const rules=rulesFor(state,candidate), winners:('A'|'B')[]=[], games:GameSnapshot[]=[], baselines:Record<string,ScoreBaseline>={}
      requireThat(action.games.length<=rules.bestOf, `This match has at most ${rules.bestOf} games.`)
      if(match.round==='Round robin' && state.seeds[match.division]) requireThat(action.preserveSeeds, 'Playoff seeds are confirmed. Explicitly keep those seeds to update this result.')
      for(const [i,score] of action.games.entries()) {
        requireThat(!matchWinner(winners,rules), 'Remove extra games after the match was already won.')
        requireThat(!rules.pointCap || (score.a<=rules.pointCap&&score.b<=rules.pointCap), `Game ${i+1}: the cap is ${rules.pointCap}.`)
        const current=action.mode==='live'&&i===action.games.length-1
        const service=current?action.service:undefined
        if(current) requireThat(service, 'Choose the current serving team, server, receiver and service court.')
        const snapshot:GameSnapshot={teamAScore:score.a,teamBScore:score.b,servingSide:service?.serving??'A',serverNumber:service?(rules.sideOutScoring?service.serverNumber:1):null,firstServerExceptionActive:service?rules.sideOutScoring&&service.openingServe:false,serviceSide:service?.court??null,status:'in_progress',winnerSide:null}
        const winner=gameWinner(snapshot,rules)
        if(current) {
          requireThat(!winner, `Game ${i+1} is already complete. Record it as completed and add the current game, or save a final result.`)
          requireThat(!service!.openingServe||!rules.sideOutScoring||(service!.serverNumber===2&&(service!.serving==='A'?score.b:score.a)===0), 'An opening service turn uses server 2 and the receiving team must have zero points.')
          baselines[String(i)]={serving:service!.serving,server:service!.server,receiver:service!.receiver,court:service!.court,serverNumber:rules.sideOutScoring?service!.serverNumber:1,firstServerExceptionActive:rules.sideOutScoring&&service!.openingServe,teamAScore:score.a,teamBScore:score.b}
          games.push(snapshot)
        } else {
          requireThat(winner, `Game ${i+1} needs a valid winning score: to ${rules.pointsToWin}, win by ${rules.winBy}${rules.pointCap?`, cap ${rules.pointCap}`:''}.`)
          const previous={...snapshot,...(winner==='A'?{teamAScore:score.a-1}:{teamBScore:score.b-1})}
          requireThat(!gameWinner(previous,rules), `Game ${i+1} has points after the game should have ended. Check the winning score.`)
          winners.push(winner);games.push(finalizeIfWon(snapshot,rules))
        }
      }
      const side=matchWinner(winners,rules),nextWinner=action.mode==='final'?(side==='A'?match.a.team:match.b.team):undefined
      if(action.mode==='final') requireThat(side, `Enter all games needed to win this best-of-${rules.bestOf} match.`)
      const downstreamStarted=descendants(state,match.number).some(m=>m.status!=='Scheduled')
      requireThat(!downstreamStarted||(action.mode==='final'&&nextWinner===match.winner), 'A dependent playoff match has started. You can correct scores while retaining the same winner; a winner change needs downstream correction first.')
      if(action.mode==='live') {
        requireThat(eventCourts(state).includes(match.court), 'Assign this match to a configured court before resuming it.')
        const busy=state.matches.filter(m=>m.number!==match.number&&(m.status==='Live'||m.status==='Awaiting confirmation'))
        requireThat(!busy.some(m=>m.court===match.court), 'This court already has another active match. Reassign the match before resuming it.')
        const players=playerIds(state,match)
        requireThat(!busy.some(m=>playerIds(state,m).some(p=>players.includes(p))), 'A player is already playing another active match.')
      }
      const at=new Date().toISOString(),oldScore=match.games.map(g=>`${g.teamAScore}–${g.teamBScore}`).join(' / ')||'No score'
      match.scoreArchives??=[]
      match.scoreArchives.push({at,reason:action.reason,games:structuredClone(match.games),rallies:structuredClone(match.rallies),starts:structuredClone(match.starts),...(match.manualBaselines?{manualBaselines:structuredClone(match.manualBaselines)}:{}),status:match.status,...(match.winner?{winner:match.winner}:{})})
      match.games=games;match.rallies=games.map(()=>[]);match.starts=games.map((_,i)=>{const b=baselines[String(i)];return b?{serving:b.serving,server:b.server,receiver:b.receiver}:{serving:'A',server:0,receiver:0}})
      match.manualBaselines=baselines;match.sideOutScoring=candidate.sideOutScoring;match.history=[]
      match.status=action.mode==='final'?'Final':'Live';if(nextWinner)match.winner=nextWinner;else delete match.winner
      match.scoreEntry={at,reason:action.reason,mode:action.mode}
      const last=games.length-1,baseline=baselines[String(last)],newScore=games.map(g=>`${g.teamAScore}–${g.teamBScore}`).join(' / ')
      match.log.push({at,action:'manualScore',game:last+1,reason:action.reason,score:newScore,server:baseline?playerName(state,match,baseline.serving,baseline.server):'Not recorded',receiver:baseline?playerName(state,match,baseline.serving==='A'?'B':'A',baseline.receiver):'Not recorded',nextServer:baseline?playerName(state,match,baseline.serving,baseline.server):'Not recorded',serviceCourt:baseline?.court??'not recorded'})
      detail=`Admin ${action.mode==='final'?'final result':'current-score checkpoint'}: ${oldScore} → ${newScore}. ${action.reason}${action.preserveSeeds?' Confirmed playoff seeds retained.':''}`
    } else if (action.action === 'schedule') {
      requireThat(match.status === 'Scheduled', 'Only unstarted matches can be rescheduled.')
      detail = `${match.time}, Court ${match.court} → ${action.time}, Court ${action.court}`
      requireThat(eventCourts(state).includes(action.court), 'Add this court in Scorers before assigning matches.')
      match.court = action.court; match.time = action.time; if(action.date) match.date=action.date
      const conflicts = scheduleConflicts(state)
      if(state.settings.sport!=='pickleball')requireThat(!conflicts.length, conflicts[0] ?? '')
    } else if (action.action === 'cancelMatch') {
      requireThat(match.status === 'Live' || match.status === 'Awaiting confirmation', 'Only an unconfirmed match can be cancelled.')
      match.games = []; match.rallies = []; match.starts = []; match.log = []; match.history = [];
      match.status = 'Scheduled'; delete match.winner; delete match.coinToss; delete match.manualBaselines; delete match.scoreEntry
      detail = 'Cancelled accidental start and cleared unconfirmed scoring; match returned to schedule.'
    } else if (action.action === 'reopen') {
      requireThat(match.status === 'Final', 'Only final matches can be reopened.')
      if (match.round === 'Round robin') requireThat(!state.seeds[match.division], 'Clear this division’s playoff seeds before correcting a round-robin result.')
      requireThat(!descendants(state, match.number).some(m => m.status !== 'Scheduled'), 'A dependent playoff match has started. Correct it first, working back through the bracket.')
      match.status = 'Awaiting confirmation'; delete match.winner
      detail = action.reason
    } else if (action.action === 'start') {
      requireThat(match.status === 'Scheduled', 'Match has already started.')
      requireThat(match.a.team && match.b.team, 'Finalize rankings or complete the preceding matches first.')
      const targetCourt = actor.admin ? (action.court ?? match.court) : actor.court
      requireThat(actor.admin || action.court === undefined || action.court === actor.court, 'Start matches on your signed-in court.', 403)
      requireThat(eventCourts(state).includes(targetCourt), 'This court is not configured for the tournament.')
      const previousCourt = match.court
      const busy = state.matches.filter(m => m.status === 'Live' || m.status === 'Awaiting confirmation')
      requireThat(!busy.some(m => m.court === targetCourt), 'Another match is still active on this court.')
      const players = playerIds(state, match)
      requireThat(!busy.some(m => playerIds(state, m).some(p => players.includes(p))), 'A player is still playing on another court.')
      if (state.settings.sport!=='pickleball' && match.round === 'Final') requireThat(!state.matches.some(m => m.round === 'Final' && m.number < match.number && m.status !== 'Final'), 'Complete the earlier final first. Finals are consecutive.')
      delete match.manualBaselines; delete match.scoreEntry
      match.court = targetCourt
      match.coinToss = { winner: action.coinTossWinner, at: new Date().toISOString() };
      detail = `Started on Court ${targetCourt}${previousCourt !== targetCourt ? ` (moved from Court ${previousCourt})` : ''}. Coin toss won by ${state.teams.find(t => t.id === (action.coinTossWinner === 'A' ? match.a.team : match.b.team))!.name}. First serving team: ${action.serving}.`;
      if(state.settings.sport==='pickleball')match.sideOutScoring=state.settings.sideOutScoring!==false
      match.games = [state.settings.sport==='pickleball'?pickleballSnapshot({serving:action.serving,server:action.server,receiver:action.receiver},[],rulesFor(state,match)):createBadmintonGame(action.serving)]; match.rallies = [[]]; match.starts=[{serving:action.serving,server:action.server,receiver:action.receiver}]; match.status = 'Live'
    } else if (action.action === 'point') {
      requireThat(match.status === 'Live', 'This match is not accepting points.')
      requireThat(!match.games.at(-1)?.winnerSide, 'Review this game, then start the next game.')
      match.history.push({ games: structuredClone(match.games), status: match.status }); match.history=match.history.slice(-5)
      const i = match.games.length - 1
      match.rallies[i].push(action.side)
      match.games[i] = state.settings.sport==='pickleball'?pickleballSnapshot(match.starts[i],match.rallies[i],rulesFor(state,match),match.manualBaselines?.[i]):awardBadmintonRally(match.games[i], action.side, rulesFor(state, match)).next
      if (winnerSide(state, match)) match.status = 'Awaiting confirmation'
      detail = `Point ${action.side}`
    } else if (action.action === 'removePoint') {
      requireThat(match.status === 'Live' || match.status === 'Awaiting confirmation', 'Reopen a final match before correcting it.')
      const i = match.games.length - 1, rallies = match.rallies[i]
      const index = rallies.lastIndexOf(action.side)
      requireThat(index !== -1, 'This team has no points to remove in the current game.')
      match.history.push({ games: structuredClone(match.games), status: match.status }); match.history=match.history.slice(-5)
      rallies.splice(index, 1)
      // Replay the remaining rallies to keep service and winner state consistent.
      const first = match.starts[i].serving
      let game = state.settings.sport==='pickleball'?pickleballSnapshot(match.starts[i],[],rulesFor(state,match),match.manualBaselines?.[i]):createBadmintonGame(first)
      for (const [rallyIndex,side] of rallies.entries()) {
        requireThat(game.status !== 'completed', 'This correction would put rallies after a completed game. Remove the most recent winning point first.')
        game = state.settings.sport==='pickleball'?pickleballSnapshot(match.starts[i],rallies.slice(0,rallyIndex+1),rulesFor(state,match),match.manualBaselines?.[i]):awardBadmintonRally(game, side, rulesFor(state, match)).next
      }
      match.games[i] = game
      match.status = winnerSide(state, match) ? 'Awaiting confirmation' : 'Live'
      detail = `Removed latest point for ${action.side} in game ${i+1}`
    } else if (action.action === 'nextGame') {
      requireThat(match.status === 'Live' && match.games.at(-1)?.winnerSide && !winnerSide(state, match), 'Complete the current game first.')
      if(match.scoreEntry)requireThat(action.serving, 'Choose the first serving team for the next game; the opening service history was not fully recorded.')
      const serving=match.scoreEntry?action.serving!:nextServingTeam(state,match)
      match.games.push(state.settings.sport==='pickleball'?pickleballSnapshot({serving,server:action.server,receiver:action.receiver},[],rulesFor(state,match)):createBadmintonGame(serving)); match.rallies.push([]);match.starts.push({serving,server:action.server,receiver:action.receiver})
    } else if (action.action === 'submit') {
      requireThat(match.status === 'Awaiting confirmation', 'Finish the required games before confirming the result.')
      const side = winnerSide(state, match)
      requireThat(side, 'Match has no valid winner.')
      match.winner = side === 'A' ? match.a.team : match.b.team
      match.status = 'Final'
      detail = match.games.map(g => `${g.teamAScore}-${g.teamBScore}`).join(', ')
    }
    if (['start','nextGame','point','removePoint'].includes(action.action)) {
      const i=match.games.length-1, next=serviceFor(state,match,i)
      const prior=action.action==='start'||action.action==='nextGame'?next:beforeService!
      match.log.push({at:new Date().toISOString(),action:action.action==='point'?'point':action.action==='removePoint'?'removePoint':'startGame',game:i+1,...('side' in action?{side:action.side}:{}),server:playerName(state,match,prior.serving,prior.server),receiver:playerName(state,match,prior.receiving,prior.receiver),score:`${match.games[i].teamAScore}–${match.games[i].teamBScore}`,nextServer:playerName(state,match,next.serving,next.server),serviceCourt:next.court})
    }
    match.version++
  } else {
    requireThat(state.version === action.version, 'Tournament changed. Refresh and try again.', 409)
    if (action.action === 'resetDemo') {
      for (const m of state.matches) {
        m.games = []; m.rallies = []; m.starts = []; m.log = []; m.history = [];
        m.status = 'Scheduled'; delete m.winner; delete m.coinToss; delete m.manualBaselines; delete m.scoreEntry; delete m.scoreArchives; m.version++;
      }
      state.seeds = {}; state.coinTosses = [];
      for (const team of state.teams) team.checkedIn = false
      detail = 'Reset demo: cleared all scores, results, serving history, rankings, coin tosses and check-ins. Preserved teams, schedule, settings and scorer access.'
    } else if (action.action === 'settings') {
      if (state.matches.some(m => m.status !== 'Scheduled')) requireThat(action.settings.winBy === state.settings.winBy && action.settings.cap === state.settings.cap, 'Scoring rules are locked after play begins.')
      state.settings = { ...state.settings, ...action.settings }
    } else if (action.action === 'publish') {
      if (action.published) {
        requireThat(state.settings.reviewed, 'Review player identities, scoring rules, and source schedule before publishing.')
        requireThat(state.settings.venue.trim(), 'Add the venue before publishing.')
        const conflicts = scheduleConflicts(state)
        if(state.settings.sport!=='pickleball')requireThat(!conflicts.length, conflicts[0] ?? '')
      }
      state.published = action.published
    } else if (action.action === 'team') {
      const team = state.teams.find(t => t.id === action.id)
      requireThat(team, 'Team not found.')
      const identities = action.players.map(p => p.toLowerCase())
      requireThat(new Set(identities).size === 2, 'A doubles team needs two different players.')
      if (state.matches.some(m => (m.a.team === team.id || m.b.team === team.id) && m.status !== 'Scheduled')) requireThat(JSON.stringify(identities) === JSON.stringify(team.players), 'Player identities are locked after their first match starts.')
      team.name = action.name; team.players = identities; team.checkedIn = action.checkedIn
      const labels = action.name.split("/").map(p => p.trim())
      if (labels.length === 2 && labels.every(Boolean)) team.displayPlayers = labels as [string, string]
      const conflicts = scheduleConflicts(state)
      if(state.settings.sport!=='pickleball')requireThat(!conflicts.length, conflicts[0] ?? '')
    } else if (action.action === 'coinToss') {
      unstartedKnockouts(state, action.division)
      requireThat(!state.seeds[action.division], 'Clear this division’s seeds before recording a tie-break correction.')
      requireThat(state.matches.filter(m => m.division === action.division && m.round === 'Round robin').every(m => m.status === 'Final') || (action.action==='coinToss'&&state.settings.sport==='pickleball') || ('overrideReason' in action && Boolean(action.overrideReason)), 'Complete all round-robin matches or provide an admin playoff override reason.')
      const ids = state.teams.filter(t => t.division === action.division).map(t => t.id)
      requireThat(new Set(action.teams).size === action.teams.length && action.teams.every(id => ids.includes(id)), 'Select different teams from this division.')
      requireThat(action.teams.includes(action.winner), 'The toss winner must be one of the selected teams.')
      const name = (id: string) => state.teams.find(t => t.id === id)!.name
      state.coinTosses ??= []
      state.coinTosses.push({ id: action.requestId, division: action.division, teams: action.teams, winner: action.winner, note: action.note, at: new Date().toISOString(), actor: 'Admin' })
      detail = `${action.division==='mixed'&&state.settings.mixedDoubles?'Physical draw / coin toss':'Coin toss'}: ${action.teams.map(name).join(' vs ')}. Winner: ${name(action.winner)}.${action.note ? ` ${action.note}` : ''}`
    } else if (action.action === 'seed') {
      unstartedKnockouts(state, action.division)
      requireThat(state.matches.filter(m => m.division === action.division && m.round === 'Round robin').every(m => m.status === 'Final') || ('overrideReason' in action && Boolean(action.overrideReason)), 'Complete all round-robin matches or provide an admin playoff override reason.')
      const ids = state.teams.filter(t => t.division === action.division).map(t => t.id)
      requireThat(ids.length === action.order.length && new Set(action.order).size === ids.length && action.order.every(id => ids.includes(id)), 'Each team must appear exactly once in the ranking.')
      state.seeds[action.division] = action.order
      detail = `${action.division}: ${action.order.join(', ')}${action.overrideReason?` · EARLY PLAYOFF OVERRIDE: ${action.overrideReason}`:''}`
    } else if (action.action === 'clearSeeds') {
      unstartedKnockouts(state, action.division)
      delete state.seeds[action.division]
    } else if (action.action === 'addCourt' || action.action === 'scorerAccount') {
      const courts = eventCourts(state)
      const court = action.action === 'addCourt' ? courts.length + 1 : action.court
      requireThat(court <= MAX_COURTS && (action.action === 'addCourt' || courts.includes(court)), 'Court not available.')
      requireThat(!courts.some(n => n !== court && (state.scorerAccounts?.[String(n)]?.username ?? `court${n}`) === action.username), 'This username is already assigned to another court.')
      const previous = state.scorerAccounts?.[String(court)]
      requireThat(action.password || previous, 'Set a password when first configuring this account.')
      state.scorerAccounts ??= {}
      state.scorerAccounts[String(court)] = { username: action.username, passwordHash: action.password ? hashScorerPassword(action.password) : previous!.passwordHash }
      delete state.courtSessions[String(court)]
      if (action.action === 'addCourt') {
        state.settings.courtCount = court
        state.scorerNames[String(court)] = `Court ${court} scorer`
        state.scorerEnabled[String(court)] = true
      }
      detail = `Court ${court}: ${action.action === 'addCourt' ? 'added' : 'credentials updated'}; username ${action.username}. Previous session ended.`
    } else if (action.action === 'scorer') {
      requireThat(eventCourts(state).includes(action.court), 'Court not configured.')
      state.scorerNames[String(action.court)] = action.name
      state.scorerEnabled[String(action.court)] = action.enabled
      if (!action.enabled) delete state.courtSessions[String(action.court)]
      detail = `Court ${action.court}: ${action.name}, ${action.enabled ? 'enabled' : 'disabled'}`
    } else if (action.action === 'releaseScorer') {
      requireThat(eventCourts(state).includes(action.court), 'Court not configured.')
      delete state.courtSessions[String(action.court)]
      detail = `Ended Court ${action.court} scoring session`
    }
  }
  resolveSlots(state)
  state.version++; state.updatedAt = new Date().toISOString()
  state.requests.push(requestKey); state.requests = state.requests.slice(-5000)
  state.audit.push({ at: state.updatedAt, actor: actor.admin ? 'Admin' : `${state.scorerNames[String(actor.court)]} (court${actor.court})`, action: action.action, ...('match' in action ? { match: action.match } : {}), detail })
  return state
}

export function publicView(state: EventState, admin = false) {
  const { courtSessions, requests: _requests, audit, scorerAccounts: _accounts, ...view } = state
  const slim = { ...view, matches: view.matches.map(m => ({ ...m, scoreArchives:[], history: [], log: [] })) }
  return admin ? { ...slim, scorerUsernames: Object.fromEntries(eventCourts(state).map(n => [String(n), state.scorerAccounts?.[String(n)]?.username ?? `court${n}`])), activeCourts: Object.keys(courtSessions).map(Number), audit: audit.slice(-100) } : slim
}
