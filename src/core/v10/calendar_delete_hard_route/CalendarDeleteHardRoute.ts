export type CalendarDeleteHardRouteClassification = {
  matched: boolean;
  normalized: string;
  startsExplicitly: boolean;
  hasDeleteVerb: boolean;
  hasCalendarObject: boolean;
  firstToken: string;
};

function normalizeDeleteText(value: string): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const DELETE_VERBS = new Set([
  "supprime",
  "supprimer",
  "supprimes",
  "supprimez",
  "suprime",
  "suprimer",
  "suprimes",
  "suprimez",
  "efface",
  "effacer",
  "annule",
  "annuler",
  "retire",
  "retirer",
  "enleve",
  "enlever",
]);

/**
 * V10-044B5
 * Deterministic DELETE classifier.
 * No dynamic RegExp is used for the DELETE verb anymore.
 * This module only classifies intent; it never sends a DELETE request.
 */
export function classifyCalendarDeleteHardRoute(
  message: string
): CalendarDeleteHardRouteClassification {
  const normalized = normalizeDeleteText(message);
  const tokens = normalized.split(" ").filter(Boolean);
  const firstToken = tokens[0] ?? "";

  const startsExplicitly = DELETE_VERBS.has(firstToken);
  const hasDeleteVerb = tokens.some((token) => DELETE_VERBS.has(token));

  const hasCalendarObject = tokens.some((token, index) => {
    if (
      token === "rdv" ||
      token === "agenda" ||
      token === "calendrier" ||
      token === "calendar" ||
      token === "evenement" ||
      token === "event"
    ) {
      return true;
    }

    if (token === "rendez-vous" || token === "rendezvous") {
      return true;
    }

    if (token === "rendez" && tokens[index + 1] === "vous") {
      return true;
    }

    return false;
  });

  return {
    matched: startsExplicitly || (hasDeleteVerb && hasCalendarObject),
    normalized,
    startsExplicitly,
    hasDeleteVerb,
    hasCalendarObject,
    firstToken,
  };
}
