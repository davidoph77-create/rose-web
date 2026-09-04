import {
  createCalendarConversationContext,
  prepareCalendarConversationQuery,
  updateCalendarConversationContext,
} from "./CalendarConversationContext";

export function runCalendarConversationSelfTest() {
  let ctx = createCalendarConversationContext();

  const first = prepareCalendarConversationQuery(
    "Quels sont mes rendez-vous demain ?",
    ctx
  );

  ctx = updateCalendarConversationContext(ctx, {
    originalMessage: "Quels sont mes rendez-vous demain ?",
    resolvedQuery: first.query,
    intent: "calendar",
    eventCount: 2,
  });

  const time = prepareCalendarConversationQuery(
    "À quelle heure est le premier ?",
    ctx
  );

  const location = prepareCalendarConversationQuery(
    "Où est ce rendez-vous ?",
    ctx
  );

  const next = prepareCalendarConversationQuery("Et après ?", ctx);

  return {
    ok:
      first.query.length > 0 &&
      time.usedContext &&
      location.usedContext &&
      next.usedContext,
    first,
    time,
    location,
    next,
  };
}
