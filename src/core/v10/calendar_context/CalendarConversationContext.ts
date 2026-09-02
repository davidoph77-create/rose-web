import type {
  CalendarConversationSnapshot,
  CalendarContextEvent,
  CalendarContextWindow,
  CalendarFollowUpIntent,
} from "./CalendarConversationTypes";

const MAX_AGE_MS = 15 * 60 * 1000;

let snapshot: CalendarConversationSnapshot | null = null;

export function saveCalendarConversationContext(input: {
  window: CalendarContextWindow;
  query: string;
  events: CalendarContextEvent[];
  selectedIndex?: number | null;
}) {
  snapshot = {
    window: input.window,
    query: input.query,
    events: Array.isArray(input.events) ? input.events : [],
    selectedIndex: input.selectedIndex ?? null,
    updatedAt: Date.now(),
  };
  return snapshot;
}

export function getCalendarConversationContext() {
  if (!snapshot) return null;
  if (Date.now() - snapshot.updatedAt > MAX_AGE_MS) {
    snapshot = null;
    return null;
  }
  return snapshot;
}

export function clearCalendarConversationContext() {
  snapshot = null;
}

export function setCalendarSelectedEvent(index: number | null) {
  const current = getCalendarConversationContext();
  if (!current) return null;
  if (index === null) {
    current.selectedIndex = null;
  } else if (index >= 0 && index < current.events.length) {
    current.selectedIndex = index;
  }
  current.updatedAt = Date.now();
  snapshot = current;
  return snapshot;
}

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .trim();
}

export function detectCalendarFollowUpIntent(text: string): CalendarFollowUpIntent {
  const q = normalize(text);

  if (!q) return "unknown";
  if (
    /\b(et apres|apres|le suivant|la suivante|suivant|suivante|ensuite)\b/.test(q)
  ) return "next";

  if (
    /\b(le premier|la premiere|premier rendez-vous|premiere rendez-vous)\b/.test(q)
  ) return "first";

  if (
    /\b(a quelle heure|quelle heure|horaire|quand)\b/.test(q)
  ) return "time";

  if (
    /\b(ou est|ou se trouve|adresse|lieu|localisation)\b/.test(q)
  ) return "location";

  if (
    /\b(resume|rappelle|rappelle-moi|quels rendez-vous|mes rendez-vous)\b/.test(q)
  ) return "summary";

  return "unknown";
}

function getTargetEvent(ctx: CalendarConversationSnapshot, intent: CalendarFollowUpIntent) {
  if (!ctx.events.length) return null;

  if (intent === "first") {
    ctx.selectedIndex = 0;
    return ctx.events[0];
  }

  if (intent === "next") {
    const base = ctx.selectedIndex ?? 0;
    const next = Math.min(base + 1, ctx.events.length - 1);
    ctx.selectedIndex = next;
    return ctx.events[next];
  }

  const idx = ctx.selectedIndex ?? 0;
  ctx.selectedIndex = idx;
  return ctx.events[idx];
}

function formatEvent(event: CalendarContextEvent | null) {
  if (!event) return "Je n'ai pas de rendez-vous correspondant dans le contexte actuel.";
  const title = event.title || "Rendez-vous";
  const start = event.start ? ` à ${event.start}` : "";
  const location = event.location ? ` — ${event.location}` : "";
  return `${title}${start}${location}`;
}

export function answerCalendarFollowUp(text: string): string | null {
  const ctx = getCalendarConversationContext();
  if (!ctx) return null;

  const intent = detectCalendarFollowUpIntent(text);
  if (intent === "unknown") return null;

  if (intent === "summary") {
    if (!ctx.events.length) return "Aucun rendez-vous n'est mémorisé dans le contexte Agenda actuel.";
    return ctx.events.map((event, index) => `${index + 1}. ${formatEvent(event)}`).join("\n");
  }

  const event = getTargetEvent(ctx, intent);
  if (!event) return "Je n'ai pas de rendez-vous correspondant dans le contexte actuel.";

  if (intent === "time") {
    return event.start
      ? `Le rendez-vous « ${event.title || "Rendez-vous"} » est prévu à ${event.start}.`
      : `Je n'ai pas d'horaire disponible pour « ${event.title || "ce rendez-vous"} ».`;
  }

  if (intent === "location") {
    return event.location
      ? `Le rendez-vous « ${event.title || "Rendez-vous"} » est prévu à ${event.location}.`
      : `Je n'ai pas de lieu enregistré pour « ${event.title || "ce rendez-vous"} ».`;
  }

  if (intent === "first") {
    return `Le premier rendez-vous est : ${formatEvent(event)}.`;
  }

  if (intent === "next") {
    return `Ensuite : ${formatEvent(event)}.`;
  }

  return null;
}
