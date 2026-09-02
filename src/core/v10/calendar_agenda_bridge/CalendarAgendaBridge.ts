import { readUpcomingGoogleCalendarEvents } from "../calendar_real_read";
import type {
  AgendaCalendarItem,
  AgendaCalendarSnapshot,
} from "./CalendarAgendaBridgeTypes";

let snapshot: AgendaCalendarSnapshot = {
  updatedAt: new Date(0).toISOString(),
  items: [],
  readOnly: true,
};

export async function refreshAgendaCalendarBridge(
  maxResults = 20
): Promise<AgendaCalendarSnapshot> {
  const result = await readUpcomingGoogleCalendarEvents(maxResults);

  if (!result.ok) {
    snapshot = {
      updatedAt: new Date().toISOString(),
      items: [],
      readOnly: true,
      error: result.error || "Google Calendar read failed.",
    };
    return snapshot;
  }

  const items: AgendaCalendarItem[] = result.events.map((event) => ({
    id: event.id,
    title: event.summary,
    start: event.start,
    end: event.end,
    location: event.location,
    source: "google-calendar",
    readOnly: true,
  }));

  snapshot = {
    updatedAt: new Date().toISOString(),
    items,
    readOnly: true,
  };

  return snapshot;
}

export function getAgendaCalendarSnapshot(): AgendaCalendarSnapshot {
  return snapshot;
}

export function clearAgendaCalendarSnapshot() {
  snapshot = {
    updatedAt: new Date(0).toISOString(),
    items: [],
    readOnly: true,
  };
}
