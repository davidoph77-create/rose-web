export type CalendarUpdateDraft = {
  originalMessage: string;
  targetHint: string;
  oldTime?: string;
  newTime?: string;
  requestedChange: string;
};

export type CalendarUpdatePreparation = {
  handled: boolean;
  draft?: CalendarUpdateDraft;
  text: string;
};

function normalize(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function formatHour(raw?: string) {
  if (!raw) return undefined;
  const m = raw.match(/(\d{1,2})(?:\s*(?:h|:)(?:\s*(\d{1,2}))?)?/i);
  if (!m) return raw.trim();
  const hh = Number(m[1]);
  const mm = m[2] ? Number(m[2]) : 0;
  return mm ? `${hh} h ${String(mm).padStart(2, "0")}` : `${hh} h`;
}

export function prepareCalendarUpdateFoundation(message: string): CalendarUpdatePreparation {
  const n = normalize(message);

  // Explicit UPDATE verbs only. CREATE/DELETE remain owned by their existing routes.
  const updateIntent = /\b(decale|decaler|deplace|deplacer|reporte|reporter|modifie|modifier|change|changer)\b/.test(n);
  const calendarHint = /\b(rendez[- ]?vous|rdv|agenda|calendrier|meeting|reunion)\b/.test(n);

  if (!updateIntent || !calendarHint) return { handled: false, text: "" };

  const timeChange = n.match(/\bde\s+(\d{1,2}(?:\s*(?:h|:)\s*\d{0,2})?)\s+(?:a|vers)\s+(\d{1,2}(?:\s*(?:h|:)\s*\d{0,2})?)/i);
  const oldTime = formatHour(timeChange?.[1]);
  const newTime = formatHour(timeChange?.[2]);

  let targetHint = message
    .replace(/^(decale|décale|decaler|décaler|deplace|déplace|deplacer|déplacer|reporte|reporter|modifie|modifier|change|changer)\s+/i, "")
    .replace(/\s+de\s+\d{1,2}\s*(?:h|:)?\s*\d{0,2}\s+(?:a|à|vers)\s+\d{1,2}\s*(?:h|:)?\s*\d{0,2}.*$/i, "")
    .trim();
  if (!targetHint) targetHint = "rendez-vous demandé";

  const requestedChange = oldTime && newTime
    ? `heure : ${oldTime} → ${newTime}`
    : "modification demandée (détails à confirmer)";

  const draft: CalendarUpdateDraft = {
    originalMessage: message,
    targetHint,
    oldTime,
    newTime,
    requestedChange,
  };

  const text = [
    "J’ai détecté une demande de modification de calendrier.",
    `Rendez-vous ciblé : ${targetHint}.`,
    oldTime ? `Ancienne heure demandée : ${oldTime}.` : "Ancienne valeur : à identifier dans Google Calendar.",
    newTime ? `Nouvelle heure demandée : ${newTime}.` : "Nouvelle valeur : à préciser.",
    "V10-043A est en mode brouillon : aucune modification Google Calendar n’a été exécutée.",
    "La prochaine étape identifiera l’événement réel avant toute validation.",
  ].join(" ");

  return { handled: true, draft, text };
}
