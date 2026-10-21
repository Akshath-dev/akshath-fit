import type {DateRange,LocalDate} from './types';
export function validDate(date:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;const d=new Date(`${date}T12:00:00Z`);return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===date}
export function localDate(now:Date,timeZone:string):LocalDate{const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(key=>parts.find(p=>p.type===key)!.value).join('-')}
export function shiftDate(date:LocalDate,offset:number):LocalDate{const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10)}
export function weekRange(date:LocalDate):DateRange{const day=new Date(`${date}T12:00:00Z`).getUTCDay();const start=shiftDate(date,-((day+6)%7));return {start,end:shiftDate(start,6)}}
export function daysEnding(date:LocalDate,count:number):LocalDate[]{return Array.from({length:count},(_,i)=>shiftDate(date,i-count+1))}
export function prettyDate(date:LocalDate,options:Intl.DateTimeFormatOptions={day:'numeric',month:'short'}){return new Intl.DateTimeFormat('en-IN',{...options,timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`))}
