import type {
  CalendarWriteDraft,
  CalendarWritePreparationResult,
} from "./CalendarWriteTypes";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectCreateIntent(message: string) {
  const text = normalizeText(message);

  return [
    "ajoute",
    "ajouter",
    "cree",
    "creer",
    "planifie",
    "planifier",
    "programme",
    "programmer",
    "mets dans mon agenda",
    "note dans mon agenda",
  ].some((word) => text.includes(word));
}

function cleanupTitle(message: string) {
  let value = message.trim();

  const prefixes = [
    /^ajoute\s+/i,
    /^ajouter\s+/i,
    /^cr[ée]e?\s+/i,
    /^planifie\s+/i,
    /^planifier\s+/i,
    /^programme\s+/i,
    /^programmer\s+/i,
  ];

  for (const pattern of prefixes) {
    value = value.replace(pattern, "");
  }

  value = value
    .replace(/\bdans mon agenda\b/gi, "")
    .replace(/\bsur mon agenda\b/gi, "")
    .replace(/\bdans mon calendrier\b/gi, "")
    .replace(/\bsur mon calendrier\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return value || "Nouvel événement";
}

export function prepareCalendarWriteDraft(
  message: string
): CalendarWritePreparationResult {
  if (!message.trim() || !detectCreateIntent(message)) {
    return {
      handled: false,
      text: "",
      requiresApproval: true,
      writeEnabled: false,
    };
  }

  const draft: CalendarWriteDraft = {
    id: `calendar_draft_${Date.now()}`,
    action: "create_event",
    title: cleanupTitle(message),
    sourceMessage: message,
    requiresApproval: true,
    writeEnabled: false,
    status: "draft",
  };

  return {
    handled: true,
    draft,
    text:
      `J'ai préparé un brouillon d'événement : "${draft.title}". ` +
      "Aucune écriture Google Calendar n'a été effectuée. " +
      "La date, l'heure et le lieu seront structurés avant toute demande de validation.",
    requiresApproval: true,
    writeEnabled: false,
  };
}
