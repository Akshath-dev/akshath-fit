import {it,expect} from 'vitest';
import {localDate,weekRange,daysEnding} from './dates';
it('uses the owner timezone at the midnight boundary',()=>{expect(localDate(new Date('2026-10-20T18:29:59Z'),'Asia/Kolkata')).toBe('2026-10-20');expect(localDate(new Date('2026-10-20T18:30:00Z'),'Asia/Kolkata')).toBe('2026-10-21')});
it('keeps Monday through Sunday together',()=>{expect(weekRange('2026-10-21')).toEqual({start:'2026-10-19',end:'2026-10-25'});expect(weekRange('2026-10-25').start).toBe('2026-10-19')});
it('handles year and leap-month boundaries as calendar days',()=>{expect(daysEnding('2027-01-02',3)).toEqual(['2026-12-31','2027-01-01','2027-01-02']);expect(daysEnding('2028-03-01',3)).toEqual(['2028-02-28','2028-02-29','2028-03-01'])});
