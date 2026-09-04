export type CalendarConversationPeriod =
  | "today"
  | "tomorrow"
  | "day_after_tomorrow"
  | "this_week"
  | "next_week"
  | "upcoming"
  | null;

export type CalendarConversationFocus =
  | "list"
  | "first"
  | "next"
  | "last"
  | "time"
  | "location"
  | "duration"
  | "count"
  | null;

export type CalendarConversationContext = {
  lastCalendarQuestion: string;
  lastResolvedQuery: string;
  lastIntent?: string;
  lastEventCount?: number;
  period: CalendarConversationPeriod;
  focus: CalendarConversationFocus;
  followUpDepth: number;
  updatedAt: number;
};

export type PreparedCalendarConversationQuery = {
  query: string;
  usedContext: boolean;
  reason: string;
  period: CalendarConversationPeriod;
  focus: CalendarConversationFocus;
  followUpDepth: number;
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
    focus: null,
    followUpDepth: 0,
    updatedAt: 0,
  };
}

function detectPeriod(message: string): CalendarConversationPeriod {
  const m = normalize(message);

  if (m.includes("apres-demain") || m.includes("apres demain")) return "day_after_tomorrow";
  if (m.includes("demain")) return "tomorrow";
  if (m.includes("aujourd'hui") || m.includes("aujourdhui")) return "today";
  if (m.includes("semaine prochaine")) return "next_week";
  if (m.includes("cette semaine")) return "this_week";
  if (
    m.includes("prochain rendez-vous") ||
    m.includes("prochains rendez-vous") ||
    m.includes("a venir")
  ) return "upcoming";

  return null;
}

function periodPhrase(period: CalendarConversationPeriod): string {
  switch (period) {
    case "today": return "aujourd'hui";
    case "tomorrow": return "demain";
    case "day_after_tomorrow": return "après-demain";
    case "this_week": return "cette semaine";
    case "next_week": return "la semaine prochaine";
    case "upcoming": return "à venir";
    default: return "";
  }
}

function isContextFresh(context: CalendarConversationContext): boolean {
  return context.updatedAt > 0 && Date.now() - context.updatedAt <= CONTEXT_TTL_MS;
}

function detectFocus(message: string): CalendarConversationFocus {
  const m = normalize(message);

  if (/\b(combien|nombre de rendez-vous|nombre de rdv)\b/.test(m)) return "count";
  if (/\b(quelle duree|duree|combien de temps)\b/.test(m)) return "duration";
  if (/\b(ou est|ou se trouve|quelle adresse|a quelle adresse|quel lieu)\b/.test(m)) return "location";
  if (/\b(a quelle heure|quelle heure|horaire)\b/.test(m)) return "time";
  if (/\b(le premier|premier rendez-vous|premier rdv)\b/.test(m)) return "first";
  if (/\b(le dernier|dernier rendez-vous|dernier rdv)\b/.test(m)) return "last";
  if (/^(et apres|et ensuite|ensuite|et le suivant|le suivant|et le prochain|le prochain)\b/.test(m)) return "next";
  if (/\b(rendez-vous|rdv|agenda|calendrier)\b/.test(m)) return "list";

  return null;
}

function isFollowUp(message: string): boolean {
  const m = normalize(message);
  return (
    /^(et apres|et ensuite|ensuite|et le suivant|le suivant|et le prochain|le prochain)\b/.test(m) ||
    /\b(a quelle heure|quelle heure|horaire)\b/.test(m) ||
    /\b(ou est|ou se trouve|quelle adresse|a quelle adresse|quel lieu)\b/.test(m) ||
    /\b(le premier|premier rendez-vous|premier rdv)\b/.test(m) ||
    /\b(le dernier|dernier rendez-vous|dernier rdv)\b/.test(m) ||
    /\b(combien|nombre de rendez-vous|nombre de rdv)\b/.test(m) ||
    /\b(quelle duree|duree|combien de temps)\b/.test(m)
  );
}

function buildContextualQuery(
  original: string,
  period: CalendarConversationPeriod,
  focus: CalendarConversationFocus,
  previousFocus: CalendarConversationFocus
): string {
  const suffix = periodPhrase(period);
  const when = suffix ? ` ${suffix}` : "";

  switch (focus) {
    case "first":
      return `Quel est mon premier rendez-vous${when} ?`;

    case "last":
      return `Quel est mon dernier rendez-vous${when} ?`;

    case "next":
      return `Quels sont mes rendez-vous suivants${when} ?`;

    case "time":
      if (previousFocus === "last") {
        return `À quelle heure est mon dernier rendez-vous${when} ?`;
      }
      if (previousFocus === "next") {
        return `À quelle heure est mon prochain rendez-vous${when} ?`;
      }
      return `À quelle heure est mon premier rendez-vous${when} ?`;

    case "location":
      if (previousFocus === "last") {
        return `Où se trouve mon dernier rendez-vous${when} ?`;
      }
      if (previousFocus === "next") {
        return `Où se trouve mon prochain rendez-vous${when} ?`;
      }
      return `Où se trouve mon premier rendez-vous${when} ?`;

    case "duration":
      if (previousFocus === "last") {
        return `Quelle est la durée de mon dernier rendez-vous${when} ?`;
      }
      if (previousFocus === "next") {
        return `Quelle est la durée de mon prochain rendez-vous${when} ?`;
      }
      return `Quelle est la durée de mon premier rendez-vous${when} ?`;

    case "count":
      return `Combien ai-je de rendez-vous${when} ?`;

    default:
      return original;
  }
}

export function prepareCalendarConversationQuery(
  message: string,
  context: CalendarConversationContext
): PreparedCalendarConversationQuery {
  const clean = message.trim();
  const explicitPeriod = detectPeriod(clean);
  const detectedFocus = detectFocus(clean);

  if (explicitPeriod) {
    return {
      query: clean,
      usedContext: false,
      reason: "explicit-period",
      period: explicitPeriod,
      focus: detectedFocus || "list",
      followUpDepth: 0,
    };
  }

  if (!isFollowUp(clean) || !isContextFresh(context)) {
    return {
      query: clean,
      usedContext: false,
      reason: "standalone",
      period: explicitPeriod,
      focus: detectedFocus,
      followUpDepth: 0,
    };
  }

  const inheritedPeriod = context.period || "upcoming";
  const focus = detectedFocus || "list";
  const rewritten = buildContextualQuery(
    clean,
    inheritedPeriod,
    focus,
    context.focus
  );

  return {
    query: rewritten,
    usedContext: true,
    reason: `follow-up-${focus || "generic"}`,
    period: inheritedPeriod,
    focus,
    followUpDepth: context.followUpDepth + 1,
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
  const period =
    detectPeriod(input.originalMessage) ||
    detectPeriod(input.resolvedQuery) ||
    previous.period ||
    "upcoming";

  const focus =
    detectFocus(input.originalMessage) ||
    detectFocus(input.resolvedQuery) ||
    previous.focus ||
    "list";

  const wasFollowUp = isFollowUp(input.originalMessage) && isContextFresh(previous);

  return {
    lastCalendarQuestion: input.originalMessage,
    lastResolvedQuery: input.resolvedQuery,
    lastIntent: input.intent,
    lastEventCount: input.eventCount,
    period,
    focus,
    followUpDepth: wasFollowUp ? previous.followUpDepth + 1 : 0,
    updatedAt: Date.now(),
  };
}

export function formatCalendarConversationDiagnostic(
  prepared: PreparedCalendarConversationQuery,
  context: CalendarConversationContext
): string {
  return [
    `context=${prepared.usedContext ? "yes" : "no"}`,
    `reason=${prepared.reason}`,
    `period=${prepared.period || context.period || "none"}`,
    `focus=${prepared.focus || "none"}`,
    `depth=${prepared.followUpDepth}`,
  ].join(" / ");
}
