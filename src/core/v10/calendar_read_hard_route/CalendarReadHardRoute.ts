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

const WRITE_WORDS = [
  "cree", "creer", "ajoute", "ajouter", "planifie", "planifier",
  "programme", "programmer", "modifie", "modifier", "deplace", "deplacer",
  "supprime", "supprimer", "annule", "annuler", "invite", "inviter"
];

const CALENDAR_WORDS = [
  "agenda", "calendrier", "calendar", "rendez vous", "rdv", "planning"
];

const READ_WORDS = [
  "quels sont", "quel est", "qu ai je", "qu est ce que j ai", "j ai quoi",
  "mes rendez vous", "mon rendez vous", "prochain rendez vous", "prochain rdv",
  "mes rdv", "aujourd hui", "demain", "cette semaine", "semaine", "prochain",
  "prochaine", "a venir", "premier", "premiere", "suivant", "suivante",
  "apres", "dernier", "derniere", "combien", "a quelle heure", "quelle heure",
  "ou est", "ou a lieu"
];

export function classifyCalendarReadHardRoute(
  originalMessage: string,
  resolvedQuery?: string
) {
  const original = normalizeText(originalMessage || "");
  const resolved = normalizeText(resolvedQuery || "");
  const combined = `${original} ${resolved}`.trim();

  const hasWriteIntent = WRITE_WORDS.some((word) => combined.includes(word));
  if (hasWriteIntent) {
    return { isCalendarRead: false, reason: "explicit-write-intent" };
  }

  const hasCalendarWord = CALENDAR_WORDS.some((word) => combined.includes(word));
  const hasReadWord = READ_WORDS.some((word) => combined.includes(word));

  if (hasCalendarWord && hasReadWord) {
    return { isCalendarRead: true, reason: "calendar+read" };
  }

  if (
    resolved &&
    CALENDAR_WORDS.some((word) => resolved.includes(word))
  ) {
    return { isCalendarRead: true, reason: "resolved-calendar-context" };
  }

  if (
    combined.includes("rendez vous") ||
    combined.includes("rdv")
  ) {
    return { isCalendarRead: true, reason: "direct-rendez-vous-read" };
  }

  return { isCalendarRead: false, reason: "not-calendar-read" };
}
