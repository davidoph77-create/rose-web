import { refreshAgendaCalendarBridge } from "../calendar_agenda_bridge";
import type { AgendaCalendarItem } from "../calendar_agenda_bridge";
import type {
  CalendarQuestionAnswer,
  CalendarQuestionIntent,
} from "./CalendarAssistantTypes";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectIntent(message: string): CalendarQuestionIntent {
  const text = normalizeText(message);

  const calendarWords = [
    "agenda",
    "calendrier",
    "calendar",
    "rendez vous",
    "rdv",
    "planning",
    "programme",
  ];

  const temporalWords = [
    "aujourd hui",
    "demain",
    "cette semaine",
    "semaine",
    "prochain",
    "prochaine",
    "a venir",
  ];

  const asksSchedule =
    calendarWords.some((word) => text.includes(word)) ||
    (
      temporalWords.some((word) => text.includes(word)) &&
      (
        text.includes("qu est ce que j ai") ||
        text.includes("qu ai je") ||
        text.includes("j ai quoi") ||
        text.includes("ai je quelque chose") ||
        text.includes("mes rendez vous") ||
        text.includes("mon prochain")
      )
    );

  if (!asksSchedule) return "not_calendar";

  if (text.includes("demain")) return "calendar_tomorrow";
  if (text.includes("aujourd hui")) return "calendar_today";
  if (text.includes("cette semaine") || text.includes("semaine")) {
    return "calendar_week";
  }
  if (
    text.includes("prochain rendez vous") ||
    text.includes("prochain rdv") ||
    text.includes("mon prochain") ||
    text.includes("prochaine")
  ) {
    return "calendar_next";
  }

  return "calendar_upcoming";
}

function startOfLocalDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfLocalDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function endOfCurrentWeek(date: Date) {
  const value = endOfLocalDay(date);
  const day = value.getDay(); // 0 Sunday, 1 Monday...
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  value.setDate(value.getDate() + daysUntilSunday);
  return value;
}

function eventDate(event: AgendaCalendarItem) {
  const date = new Date(event.start);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function filterEvents(
  items: AgendaCalendarItem[],
  intent: CalendarQuestionIntent
) {
  const now = new Date();

  const valid = items
    .filter((event) => eventDate(event))
    .sort(
      (a, b) =>
        (eventDate(a)?.getTime() || 0) - (eventDate(b)?.getTime() || 0)
    );

  if (intent === "calendar_next") {
    return valid.slice(0, 1);
  }

  if (intent === "calendar_today") {
    const start = startOfLocalDay(now);
    const end = endOfLocalDay(now);
    return valid.filter((event) => {
      const date = eventDate(event)!;
      return date >= start && date <= end;
    });
  }

  if (intent === "calendar_tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = startOfLocalDay(tomorrow);
    const end = endOfLocalDay(tomorrow);
    return valid.filter((event) => {
      const date = eventDate(event)!;
      return date >= start && date <= end;
    });
  }

  if (intent === "calendar_week") {
    const start = now;
    const end = endOfCurrentWeek(now);
    return valid.filter((event) => {
      const date = eventDate(event)!;
      return date >= start && date <= end;
    });
  }

  return valid.slice(0, 10);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function introForIntent(intent: CalendarQuestionIntent, count: number) {
  if (intent === "calendar_today") {
    return count === 0
      ? "Tu n’as aucun rendez-vous Google Calendar aujourd’hui."
      : count === 1
        ? "Tu as 1 rendez-vous aujourd’hui :"
        : `Tu as ${count} rendez-vous aujourd’hui :`;
  }

  if (intent === "calendar_tomorrow") {
    return count === 0
      ? "Tu n’as aucun rendez-vous Google Calendar demain."
      : count === 1
        ? "Tu as 1 rendez-vous demain :"
        : `Tu as ${count} rendez-vous demain :`;
  }

  if (intent === "calendar_week") {
    return count === 0
      ? "Tu n’as aucun rendez-vous Google Calendar restant cette semaine."
      : count === 1
        ? "Tu as 1 rendez-vous restant cette semaine :"
        : `Tu as ${count} rendez-vous restants cette semaine :`;
  }

  if (intent === "calendar_next") {
    return count === 0
      ? "Tu n’as aucun prochain rendez-vous Google Calendar."
      : "Ton prochain rendez-vous est :";
  }

  return count === 0
    ? "Tu n’as aucun rendez-vous Google Calendar à venir."
    : count === 1
      ? "Tu as 1 rendez-vous Google Calendar à venir :"
      : `Tu as ${count} rendez-vous Google Calendar à venir :`;
}

function formatEvent(event: AgendaCalendarItem, index: number) {
  const location = event.location ? ` — ${event.location}` : "";
  return `${index + 1}. ${event.title} — ${formatDate(event.start)}${location}`;
}

export async function answerGoogleCalendarQuestion(
  message: string
): Promise<CalendarQuestionAnswer> {
  const intent = detectIntent(message);

  if (intent === "not_calendar") {
    return {
      handled: false,
      intent,
      text: "",
      eventCount: 0,
    };
  }

  // READ ONLY: this reuses the already validated V10-041 bridge,
  // which itself uses the Google Calendar GET endpoint from V10-040D.
  const snapshot = await refreshAgendaCalendarBridge(25);

  if (snapshot.error) {
    return {
      handled: true,
      intent,
      text:
        "Je n’arrive pas à lire ton Google Agenda pour le moment. " +
        "Vérifie que ton compte Google Calendar est toujours connecté, puis réessaie.",
      eventCount: 0,
    };
  }

  const events = filterEvents(snapshot.items, intent);
  const intro = introForIntent(intent, events.length);

  if (events.length === 0) {
    return {
      handled: true,
      intent,
      text: intro,
      eventCount: 0,
    };
  }

  return {
    handled: true,
    intent,
    text: `${intro}\n${events.map(formatEvent).join("\n")}`,
    eventCount: events.length,
  };
}
