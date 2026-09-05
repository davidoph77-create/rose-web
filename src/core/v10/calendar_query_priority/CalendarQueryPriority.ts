export type CalendarQueryPriorityResult = {
  isReadOnlyCalendarQuery: boolean;
  reason: string;
};

const normalize = (value: string) =>
  value
    .toLocaleLowerCase("fr-FR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const WRITE_PATTERNS = [
  /\b(cree|creer|ajoute|ajouter|planifie|planifier|programme|programmer)\b/,
  /\b(modifie|modifier|deplace|deplacer|reporte|reporter)\b/,
  /\b(supprime|supprimer|annule|annuler)\b/,
  /\b(prends?|prendre)\s+(un\s+)?(rdv|rendez vous)\b/,
];

const READ_PATTERNS = [
  /\b(quels?|combien|quand|quelle heure|a quelle heure|ou)\b/,
  /\b(mes?|mon)\s+(rdv|rendez vous|agenda|calendrier|evenements?)\b/,
  /\b(rdv|rendez vous|agenda|calendrier|evenements?)\b/,
  /\b(premier|premiere|suivant|suivante|dernier|derniere)\b/,
  /\b(et apres|apres|ensuite)\b/,
  /\b(aujourd hui|demain|apres demain|cette semaine|semaine prochaine)\b/,
];

export function classifyCalendarQueryPriority(
  originalMessage: string,
  resolvedQuery?: string
): CalendarQueryPriorityResult {
  const original = normalize(originalMessage || "");
  const resolved = normalize(resolvedQuery || "");
  const combined = `${original} ${resolved}`.trim();

  if (!combined) {
    return { isReadOnlyCalendarQuery: false, reason: "empty" };
  }

  if (WRITE_PATTERNS.some((pattern) => pattern.test(original))) {
    return { isReadOnlyCalendarQuery: false, reason: "explicit-write-intent" };
  }

  const readScore = READ_PATTERNS.reduce(
    (score, pattern) => score + (pattern.test(combined) ? 1 : 0),
    0
  );

  const resolvedHasCalendarAnchor =
    /\b(rdv|rendez vous|agenda|calendrier|evenements?)\b/.test(resolved) ||
    /\b(premier|suivant|dernier|combien|quelle heure|ou)\b/.test(resolved);

  const originalLooksLikeFollowUp =
    /^(et )?(apres|ensuite|le premier|le dernier|ou|quelle heure|a quelle heure|combien)/.test(original);

  const isReadOnlyCalendarQuery =
    readScore >= 2 || (originalLooksLikeFollowUp && resolvedHasCalendarAnchor);

  return {
    isReadOnlyCalendarQuery,
    reason: isReadOnlyCalendarQuery ? "calendar-read-priority" : "not-calendar-read",
  };
}
