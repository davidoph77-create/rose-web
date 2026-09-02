import {
  answerCalendarFollowUp,
  clearCalendarConversationContext,
  saveCalendarConversationContext,
} from "./CalendarConversationContext";

export function runCalendarConversationSelfTest() {
  clearCalendarConversationContext();

  saveCalendarConversationContext({
    window: "tomorrow",
    query: "Quels sont mes rendez-vous demain ?",
    events: [
      { title: "Chantier Tilloy", start: "08:00", location: "Tilloy-les-Mofflaines" },
      { title: "Rendez-vous fournisseur", start: "14:30", location: "Arras" },
    ],
  });

  const first = answerCalendarFollowUp("À quelle heure est le premier ?");
  const next = answerCalendarFollowUp("Et après ?");
  const where = answerCalendarFollowUp("Où est ce rendez-vous ?");

  return {
    ok: Boolean(first && next && where),
    first,
    next,
    where,
  };
}
