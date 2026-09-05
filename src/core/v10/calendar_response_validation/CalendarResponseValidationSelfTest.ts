import { validateCalendarResponse } from "./CalendarResponseValidator";
export function runCalendarResponseValidationSelfTest() {
 const a=validateCalendarResponse({originalMessage:"À quelle heure est le premier ?",resolvedQuery:"rendez-vous demain premier heure",answerText:"Le premier rendez-vous est à 9 h.",eventCount:2});
 const b=validateCalendarResponse({originalMessage:"Combien j'en ai ?",resolvedQuery:"rendez-vous demain nombre",answerText:"Aucun rendez-vous n'est prévu.",eventCount:0});
 return {passed:a.valid&&b.valid,cases:{a,b}};
}
