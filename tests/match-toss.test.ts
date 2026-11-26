import {it,expect} from 'vitest'
import {randomUUID} from 'node:crypto'
import {createEvent} from '@/lib/event-seed'
import {applyEventAction,actionSchema,publicView} from '@/lib/event-engine'
it('requires a toss winner and records it separately from the first server; cancellation clears it',()=>{
 const s=createEvent();s.published=true;
 expect(actionSchema.safeParse({action:'start',match:1,version:0,requestId:randomUUID()}).success).toBe(false)
 applyEventAction(s,actionSchema.parse({action:'start',coinTossWinner:'B',serving:'A',match:1,version:0,requestId:randomUUID()}),{admin:true})
 expect(s.matches[0].coinToss?.winner).toBe('B');expect(s.matches[0].starts[0].serving).toBe('A');expect(publicView(s).matches[0].coinToss?.winner).toBe('B');expect(s.audit.at(-1)?.detail).toContain('Ayaan/Abeer')
 applyEventAction(s,actionSchema.parse({action:'cancelMatch',match:1,version:1,requestId:randomUUID()}),{admin:true});expect(s.matches[0].coinToss).toBeUndefined()
})
