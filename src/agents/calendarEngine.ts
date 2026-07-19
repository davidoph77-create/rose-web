import { generateId } from "../core/ids";

export type CalendarEventCategory =
  | "chantier"
  | "client"
  | "banque"
  | "notaire"
  | "maison"
  | "rose"
  | "objectif"
  | "general";

export type CalendarEventStatus =
  | "prepared"
  | "scheduled"
  | "done"
  | "cancelled";

export type RoseCalendarEvent = {
  id: string;
  title: string;
  description: string;
  category: CalendarEventCategory;
  status: CalendarEventStatus;
  suggestedDate: string;
  createdAt: string;
};

export function createCalendarEvent(
  title: string,
  description: string,
  suggestedDate = "À définir"
): RoseCalendarEvent {
  return {
    id: generateId("calendar"),
    title,
    description,
    category: detectCalendarCategory(title + " " + description),
    status: "prepared",
    suggestedDate,
    createdAt: new Date().toISOString(),
  };
}

export function detectCalendarCategory(text: string): CalendarEventCategory {
  const msg = text.toLowerCase();

  if (msg.includes("chantier") || msg.includes("couverture") || msg.includes("charpente")) {
    return "chantier";
  }

  if (msg.includes("client") || msg.includes("rendez-vous") || msg.includes("rdv")) {
    return "client";
  }

  if (msg.includes("banque") || msg.includes("crédit") || msg.includes("credit") || msg.includes("fortuneo")) {
    return "banque";
  }

  if (msg.includes("notaire") || msg.includes("signature")) {
    return "notaire";
  }

  if (msg.includes("maison") || msg.includes("immobilier")) {
    return "maison";
  }

  if (msg.includes("rose") || msg.includes("ia")) {
    return "rose";
  }

  if (msg.includes("objectif") || msg.includes("8000")) {
    return "objectif";
  }

  return "general";
}

export function suggestCalendarEventsFromMemory(
  memories: string[]
): RoseCalendarEvent[] {
  const events: RoseCalendarEvent[] = [];

  memories.forEach((memory) => {
    const msg = memory.toLowerCase();

    if (msg.includes("signature") || msg.includes("notaire")) {
      events.push(
        createCalendarEvent(
          "Préparer rendez-vous notaire",
          "Vérifier les documents, l’apport, les échanges banque/notaire et les échéances.",
          "À planifier"
        )
      );
    }

    if (msg.includes("banque") || msg.includes("crédit") || msg.includes("fortuneo")) {
      events.push(
        createCalendarEvent(
          "Suivi banque / crédit immobilier",
          "Faire le point sur le dossier, les demandes complémentaires et les dates importantes.",
          "À planifier"
        )
      );
    }

    if (msg.includes("chantier") || msg.includes("client") || msg.includes("couverture")) {
      events.push(
        createCalendarEvent(
          "Point activité chantier",
          "Faire un point sur les chantiers, clients, priorités et avancement.",
          "Cette semaine"
        )
      );
    }

    if (msg.includes("8000") || msg.includes("objectif")) {
      events.push(
        createCalendarEvent(
          "Point objectif mensuel",
          "Faire le point sur l’objectif financier et les actions de la semaine.",
          "Chaque semaine"
        )
      );
    }

    if (msg.includes("rose") || msg.includes("ia")) {
      events.push(
        createCalendarEvent(
          "Amélioration Rose IA",
          "Continuer l’évolution de Rose par moteurs stables.",
          "Cette semaine"
        )
      );
    }
  });

  return removeDuplicateCalendarEvents(events);
}

export function removeDuplicateCalendarEvents(
  events: RoseCalendarEvent[]
): RoseCalendarEvent[] {
  const seen = new Set<string>();

  return events.filter((event) => {
    const key = event.title.toLowerCase().trim();

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

export function updateCalendarEventStatus(
  events: RoseCalendarEvent[],
  eventId: string,
  status: CalendarEventStatus
): RoseCalendarEvent[] {
  return events.map((event) =>
    event.id === eventId
      ? {
          ...event,
          status,
        }
      : event
  );
}

export function deleteCalendarEvent(
  events: RoseCalendarEvent[],
  eventId: string
): RoseCalendarEvent[] {
  return events.filter((event) => event.id !== eventId);
}