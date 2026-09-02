export type CalendarConversationPeriod =
  | "today"
  | "tomorrow"
  | "day_after_tomorrow"
  | "this_week"
  | "next_week"
  | "upcoming"
  | null;

export type CalendarConversationContext = {
  lastCalendarQuestion: string;
  lastResolvedQuery: string;
  lastIntent?: string;
  lastEventCount?: number;
  period: CalendarConversationPeriod;
  updatedAt: number;
};

export type PreparedCalendarConversationQuery = {
  query: string;
  usedContext: boolean;
  reason: string;
};

const CONTEXT_TTL_MS = 15 * 60 * 1000;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export function createCalendarConversationContext(): CalendarConversationContext {
  return {
    lastCalendarQuestion: "",
    lastResolvedQuery: "",
    period: null,
    updatedAt: 0,
  };
}

function detectPeriod(message: string): CalendarConversationPeriod {
  const m = normalize(message);

  if (m.includes("apres-demain") || m.includes("apres demain")) {
    return "day_after_tomorrow";
  }
  if (m.includes("demain")) return "tomorrow";
  if (m.includes("aujourd'hui") || m.includes("aujourdhui")) return "today";
  if (m.includes("semaine prochaine")) return "next_week";
  if (m.includes("cette semaine")) return "this_week";
  if (
    m.includes("prochain rendez-vous") ||
    m.includes("prochains rendez-vous") ||
    m.includes("a venir")
  ) {
    return "upcoming";
  }

  return null;
}

function periodPhrase(period: CalendarConversationPeriod): string {
  switch (period) {
    case "today":
      return "aujourd'hui";
    case "tomorrow":
      return "demain";
    case "day_after_tomorrow":
      return "après-demain";
    case "this_week":
      return "cette semaine";
    case "next_week":
      return "la semaine prochaine";
    case "upcoming":
      return "à venir";
    default:
      return "";
  }
}

function isContextFresh(context: CalendarConversationContext): boolean {
  return (
    context.updatedAt > 0 &&
    Date.now() - context.updatedAt <= CONTEXT_TTL_MS
  );
}

function isCalendarFollowUp(message: string): boolean {
  const m = normalize(message);

  return (
    /^(et apres|et ensuite|ensuite|et le suivant|le suivant|et le prochain|le prochain)\b/.test(m) ||
    /\b(a quelle heure|quelle heure)\b/.test(m) ||
    /\b(ou est|ou se trouve|quelle adresse|a quelle adresse)\b/.test(m) ||
    /\b(le premier|premier rendez-vous|premier rdv)\b/.test(m) ||
    /\b(le dernier|dernier rendez-vous|dernier rdv)\b/.test(m) ||
    /\b(combien|quelle duree|duree)\b/.test(m)
  );
}

export function prepareCalendarConversationQuery(
  message: string,
  context: CalendarConversationContext
): PreparedCalendarConversationQuery {
  const clean = message.trim();
  const explicitPeriod = detectPeriod(clean);

  if (explicitPeriod) {
    return {
      query: clean,
      usedContext: false,
      reason: "explicit-period",
    };
  }

  if (!isCalendarFollowUp(clean) || !isContextFresh(context)) {
    return {
      query: clean,
      usedContext: false,
      reason: "no-context-needed",
    };
  }

  const p = periodPhrase(context.period);
  const suffix = p ? ` ${p}` : "";
  const m = normalize(clean);

  if (/\b(a quelle heure|quelle heure)\b/.test(m) && /\bpremier\b/.test(m)) {
    return {
      query: `À quelle heure est mon premier rendez-vous${suffix} ?`,
      usedContext: true,
      reason: "first-event-time",
    };
  }

  if (/\b(ou est|ou se trouve|quelle adresse|a quelle adresse)\b/.test(m)) {
    return {
      query: `Où se trouve mon premier rendez-vous${suffix} ?`,
      usedContext: true,
      reason: "event-location",
    };
  }

  if (/^(et apres|et ensuite|ensuite|et le suivant|le suivant|et le prochain|le prochain)\b/.test(m)) {
    return {
      query: `Quels sont mes rendez-vous suivants${suffix} ?`,
      usedContext: true,
      reason: "next-events",
    };
  }

  if (/\b(le premier|premier rendez-vous|premier rdv)\b/.test(m)) {
    return {
      query: `Quel est mon premier rendez-vous${suffix} ?`,
      usedContext: true,
      reason: "first-event",
    };
  }

  if (/\b(le dernier|dernier rendez-vous|dernier rdv)\b/.test(m)) {
    return {
      query: `Quel est mon dernier rendez-vous${suffix} ?`,
      usedContext: true,
      reason: "last-event",
    };
  }

  return {
    query: `${clean} Concernant mes rendez-vous${suffix}.`,
    usedContext: true,
    reason: "generic-calendar-follow-up",
  };
}

export function updateCalendarConversationContext(
  previous: CalendarConversationContext,
  input: {
    originalMessage: string;
    resolvedQuery: string;
    intent?: string;
    eventCount?: number;
  }
): CalendarConversationContext {
  const detected =
    detectPeriod(input.originalMessage) ||
    detectPeriod(input.resolvedQuery) ||
    previous.period ||
    "upcoming";

  return {
    lastCalendarQuestion: input.originalMessage,
    lastResolvedQuery: input.resolvedQuery,
    lastIntent: input.intent,
    lastEventCount: input.eventCount,
    period: detected,
    updatedAt: Date.now(),
  };
}
