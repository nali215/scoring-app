import {it,expect} from 'vitest'
import {randomUUID} from 'node:crypto'
import {createEvent} from '@/lib/event-seed'
import {applyEventAction,actionSchema} from '@/lib/event-engine'
it('seeds a three-team division directly into a top-two final',()=>{
 const s=createEvent();s.teams=s.teams.filter(t=>t.id!=='legends-4');s.matches=s.matches.filter(m=>![45,48].includes(m.number));const f=s.matches.find(m=>m.number===51)!;f.a={seed:1};f.b={seed:2};
 s.matches.filter(m=>m.division==='legends'&&m.round==='Round robin').forEach(m=>m.status='Final');
 const order=['legends-2','legends-3','legends-1'];applyEventAction(s,actionSchema.parse({action:'seed',division:'legends',order,version:s.version,requestId:randomUUID()}),{admin:true});expect(f.a.team).toBe(order[0]);expect(f.b.team).toBe(order[1]);expect(s.seeds.legends).toEqual(order)
})
