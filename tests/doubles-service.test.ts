import {describe,it,expect} from 'vitest'
import {doublesService} from '@/lib/doubles-service'
import {createEvent} from '@/lib/event-seed'
import {actionSchema,applyEventAction} from '@/lib/event-engine'
import {randomUUID} from 'node:crypto'
describe('doubles player service order',()=>{
 const start={serving:'A' as const,server:0 as const,receiver:0 as const}
 it('starts with Moshin serving to Ayaan, then Abeer serves when B wins',()=>{
  expect(doublesService(start,[])).toMatchObject({serving:'A',server:0,receiver:0,court:'right'})
  expect(doublesService(start,['B'])).toMatchObject({serving:'B',server:1,receiver:1,court:'left'})
 })
 it('keeps the same server on a serving-side win and swaps only that pair',()=>{
  expect(doublesService(start,['A'])).toMatchObject({serving:'A',server:0,receiver:1,court:'left'})
  expect(doublesService(start,['A','A'])).toMatchObject({serving:'A',server:0,receiver:0,court:'right'})
  expect(doublesService(start,['B','B'])).toMatchObject({serving:'B',server:1,receiver:0,court:'right'})
 })
 it('cycles service across all four players as receiving sides win',()=>{
  expect(['B','A','B','A'].map((_,i)=>doublesService(start,(['B','A','B','A'] as const).slice(0,i+1)).server)).toEqual([1,1,0,0])
 })
 it('supports either initial server and receiver',()=>{
  expect(doublesService({serving:'B',server:1,receiver:1},[])).toMatchObject({serving:'B',server:1,receiver:1,court:'right'})
 })
 it('records the actual serving player and supports wrong-team correction with minus then plus',()=>{
  const s=createEvent();s.published=true
  const act=(body:object)=>applyEventAction(s,actionSchema.parse({requestId:randomUUID(),version:s.matches[0].version,match:1,...body}),{admin:true})
  act({action:'start',coinTossWinner:'A',serving:'A',server:0,receiver:0});act({action:'point',side:'B'})
  expect(s.matches[0].log[1]).toMatchObject({server:'Moshin',receiver:'Ayaan',score:'0–1',nextServer:'Abeer',serviceCourt:'left'})
  act({action:'removePoint',side:'B'});act({action:'point',side:'A'})
  expect(s.matches[0].games[0]).toMatchObject({teamAScore:1,teamBScore:0})
  expect(doublesService(s.matches[0].starts[0],s.matches[0].rallies[0])).toMatchObject({serving:'A',server:0,court:'left'})
  expect(s.matches[0].log.map(l=>l.action)).toEqual(['startGame','point','removePoint','point'])
  expect(()=>act({action:'removePoint',side:'B'})).toThrow('no points')
 })
})
