// V10-044D4 - Calendar Intelligence READ ONLY
import { getAgendaCalendarSnapshot } from "../calendar_agenda_bridge/CalendarAgendaBridge";
import type { AgendaCalendarItem } from "../calendar_agenda_bridge/CalendarAgendaBridgeTypes";
import type { CalendarIntelligenceItem, CalendarIntelligencePeriod, CalendarIntelligenceResult } from "./CalendarIntelligenceTypes";

function startOfDay(date: Date) { const d = new Date(date); d.setHours(0,0,0,0); return d; }
function addDays(date: Date, days: number) { const d = new Date(date); d.setDate(d.getDate()+days); return d; }
function startOfWeekMonday(date: Date) {
  const d=startOfDay(date), day=d.getDay(); return addDays(d, day===0 ? -6 : 1-day);
}
function eventDate(item: AgendaCalendarItem) {
  const d=new Date(item.start); return Number.isNaN(d.getTime()) ? null : d;
}
function inRange(item: AgendaCalendarItem, from: Date, to: Date) {
  const d=eventDate(item); return !!d && d>=from && d<to;
}
function sorted(items: AgendaCalendarItem[]) {
  return [...items].sort((a,b)=>(eventDate(a)?.getTime()??Number.MAX_SAFE_INTEGER)-(eventDate(b)?.getTime()??Number.MAX_SAFE_INTEGER));
}
function convert(item: AgendaCalendarItem): CalendarIntelligenceItem {
  return { id:item.id, title:item.title, start:item.start, end:item.end, location:item.location,
    sourceCalendarId:item.sourceCalendarId, sourceCalendarName:item.sourceCalendarName, readOnly:true };
}
function format(item: CalendarIntelligenceItem) {
  const d=new Date(item.start);
  const time=Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  const cal=item.sourceCalendarName ? ` [${item.sourceCalendarName}]` : "";
  return `${time}${time ? " — " : ""}${item.title}${cal}`;
}
function summary(period: CalendarIntelligencePeriod, items: CalendarIntelligenceItem[]) {
  if (!items.length) {
    if(period==="today") return "Aucun événement trouvé aujourd’hui.";
    if(period==="tomorrow") return "Aucun événement trouvé demain.";
    if(period==="this-week") return "Aucun événement trouvé cette semaine.";
    return "Aucun prochain événement trouvé.";
  }
  if(period==="next-event") return `Prochain événement : ${format(items[0])}.`;
  const label=period==="today"?"Aujourd’hui":period==="tomorrow"?"Demain":"Cette semaine";
  return `${label} : ${items.length} événement(s). ${items.map(format).join(" | ")}`;
}

export function analyzeAgendaCalendar(period: CalendarIntelligencePeriod, now: Date=new Date()): CalendarIntelligenceResult {
  const snapshot=getAgendaCalendarSnapshot();
  if(snapshot.error) return {ok:false,period,generatedAt:new Date().toISOString(),items:[],summary:snapshot.error,readOnly:true,error:snapshot.error};
  const all=sorted(snapshot.items); let chosen: AgendaCalendarItem[]=[];
  if(period==="today"){ const from=startOfDay(now); chosen=all.filter(x=>inRange(x,from,addDays(from,1))); }
  else if(period==="tomorrow"){ const from=addDays(startOfDay(now),1); chosen=all.filter(x=>inRange(x,from,addDays(from,1))); }
  else if(period==="this-week"){ const from=startOfWeekMonday(now); chosen=all.filter(x=>inRange(x,from,addDays(from,7))); }
  else { const n=all.find(x=>{const d=eventDate(x); return !!d && d.getTime()>=now.getTime();}); chosen=n?[n]:[]; }
  const items=chosen.map(convert);
  return {ok:true,period,generatedAt:new Date().toISOString(),items,summary:summary(period,items),readOnly:true};
}
export const getTodayCalendarIntelligence=(now:Date=new Date())=>analyzeAgendaCalendar("today",now);
export const getTomorrowCalendarIntelligence=(now:Date=new Date())=>analyzeAgendaCalendar("tomorrow",now);
export const getThisWeekCalendarIntelligence=(now:Date=new Date())=>analyzeAgendaCalendar("this-week",now);
export const getNextCalendarEventIntelligence=(now:Date=new Date())=>analyzeAgendaCalendar("next-event",now);
