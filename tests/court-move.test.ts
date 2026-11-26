import {it,expect} from 'vitest'
import {randomUUID} from 'node:crypto'
import {createEvent} from '@/lib/event-seed'
import {applyEventAction,actionSchema} from '@/lib/event-engine'
it('claims an unstarted match from another court and restricts points to its actual court',()=>{
 const s=createEvent();s.published=true;s.courtSessions={'1':'one','2':'two'};
 const act=(a:object,court=1)=>applyEventAction(s,actionSchema.parse({version:0,requestId:randomUUID(),coinTossWinner:'A',...a}),{admin:false,court,session:court===1?'one':'two'});
 act({action:'start',match:2});expect(s.matches[1].court).toBe(1);expect(s.audit.at(-1)?.detail).toContain('moved from Court 2');
 expect(()=>act({action:'point',match:2,version:1,side:'A'},2)).toThrow('only matches');act({action:'point',match:2,version:1,side:'A'});expect(s.matches[1].games[0].teamAScore).toBe(1);
 expect(()=>act({action:'start',match:3})).toThrow('still active');expect(s.matches[2].court).toBe(3);
 expect(()=>act({action:'start',match:4},2)).toThrow('another court');expect(s.matches[3].court).toBe(1);
 expect(()=>act({action:'start',match:3,court:3},2)).toThrow('signed-in court')
})
