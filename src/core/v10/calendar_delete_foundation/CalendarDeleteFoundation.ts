export type CalendarDeleteDraft = {
  targetText: string;
  originalMessage: string;
  requiresResolution: true;
  requiresExplicitApproval: true;
  deleteSent: false;
};

export type CalendarDeleteFoundationResult = {
  handled: boolean;
  draft?: CalendarDeleteDraft;
  text: string;
  reason?: string;
};

function normalizeFrench(value: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[‐‑‒–—]/g, "-")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function hasDeleteVerb(text: string): boolean {
  return /\b(supprime|supprimer|supprimes|supprimez|efface|effacer|effaces|effacez|annule|annuler|annules|annulez|retire|retirer|retires|retirez|enleve|enlever|enleves|enlevez)\b/.test(text);
}

function isNegatedDelete(text: string): boolean {
  return /\b(ne|n)\s+.{0,40}\b(supprime|efface|annule|retire|enleve)\b.{0,25}\bpas\b/.test(text)
    || /\b(pas|jamais)\s+.{0,25}\b(supprimer|effacer|annuler|retirer|enlever)\b/.test(text);
}

function looksCalendarRelated(text: string): boolean {
  return /\b(rendez-vous|rendez vous|rdv|agenda|calendrier|calendar|evenement|event)\b/.test(text);
}

function extractTarget(original: string): string {
  let t = normalizeFrench(original);

  t = t
    .replace(/^\s*(peux[- ]tu|pourrais[- ]tu|merci de|je veux que tu|je voudrais que tu)\s+/i, "")
    .replace(/^\s*(supprime|supprimer|supprimes|supprimez|efface|effacer|effaces|effacez|annule|annuler|annules|annulez|retire|retirer|retires|retirez|enleve|enlever|enleves|enlevez)\s+/i, "")
    .replace(/^\s*(de|dans)\s+(mon|ma|mes|le|la|les)\s+(agenda|calendrier|calendar)\s+/i, "")
    .replace(/^\s*(mon|ma|mes|le|la|les)\s+/i, "")
    .trim();

  return t || normalizeFrench(original);
}

export function prepareCalendarDeleteFoundation(
  message: string
): CalendarDeleteFoundationResult {
  const normalized = normalizeFrench(message);

  if (!normalized || !hasDeleteVerb(normalized)) {
    return {
      handled: false,
      text: "",
      reason: "no-delete-verb",
    };
  }

  if (isNegatedDelete(normalized)) {
    return {
      handled: false,
      text: "",
      reason: "negated-delete",
    };
  }

  if (!looksCalendarRelated(normalized)) {
    return {
      handled: false,
      text: "",
      reason: "delete-not-calendar-related",
    };
  }

  const targetText = extractTarget(message);

  const draft: CalendarDeleteDraft = {
    targetText,
    originalMessage: message,
    requiresResolution: true,
    requiresExplicitApproval: true,
    deleteSent: false,
  };

  return {
    handled: true,
    draft,
    reason: "explicit-calendar-delete",
    text:
      `J’ai détecté une demande de suppression dans Google Calendar : « ${targetText} ». ` +
      "Je dois d’abord retrouver précisément le vrai événement puis te demander une confirmation explicite. " +
      "Aucune suppression n’a été envoyée à Google Calendar.",
  };
}
