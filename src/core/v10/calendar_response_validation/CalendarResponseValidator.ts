import { CalendarResponseValidationInput, CalendarResponseValidationResult } from "./CalendarResponseValidationTypes";
const norm=(v:string)=>(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
export function validateCalendarResponse(input:CalendarResponseValidationInput):CalendarResponseValidationResult {
  const warnings:string[]=[];
  const message=norm(input.originalMessage), query=norm(input.resolvedQuery);
  const answer=(input.answerText||"").trim(), a=norm(answer);
  if(!answer) warnings.push("empty-answer");
  const follow=/\b(premier|premiere|suivant|suivante|dernier|derniere|apres|heure|lieu|ou|combien|duree)\b/.test(message);
  if(follow&&!query) warnings.push("follow-up-without-resolved-query");
  if(typeof input.eventCount==="number"&&input.eventCount===0&&answer&&!/\b(aucun|aucune|pas de|n['’]ai pas|indisponible|trouve)\b/.test(a))
    warnings.push("zero-event-answer-not-explicit");
  if(typeof input.eventCount==="number"&&input.eventCount>0&&/\b(aucun rendez-vous|aucun evenement)\b/.test(a))
    warnings.push("positive-event-count-conflict");
  const valid=warnings.length===0;
  return {valid,warnings,normalizedText:answer,diagnostic:`calendar-response-validation=${valid?"ok":"warning"}${warnings.length?` warnings=${warnings.join(",")}`:""}`};
}
