import type { CalendarContextEvent, CalendarContextWindow } from "./CalendarConversationTypes";
import {
  answerCalendarFollowUp,
  saveCalendarConversationContext,
} from "./CalendarConversationContext";

export function rememberCalendarAnswer(input: {
  query: string;
  window: CalendarContextWindow;
  events: CalendarContextEvent[];
}) {
  return saveCalendarConversationContext({
    query: input.query,
    window: input.window,
    events: input.events,
    selectedIndex: input.events.length ? 0 : null,
  });
}

export function tryAnswerCalendarFollowUp(message: string) {
  return answerCalendarFollowUp(message);
}
