export type CalendarApprovalState = {
  pendingDraft: any | null;
  approvedDraft: any | null;
  updatedAt: string | null;
};

export type CalendarApprovalResult = {
  handled: boolean;
  approved: boolean;
  text: string;
  draft?: any;
};

export function createCalendarApprovalState(): CalendarApprovalState {
  return {
    pendingDraft: null,
    approvedDraft: null,
    updatedAt: null,
  };
}

export function storePendingCalendarDraft(
  state: CalendarApprovalState,
  draft: any
): CalendarApprovalState {
  return {
    ...state,
    pendingDraft: draft ?? null,
    approvedDraft: null,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeText(value: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function handleExplicitCalendarApproval(
  message: string,
  state: CalendarApprovalState
): CalendarApprovalResult {
  if (!state?.pendingDraft) {
    return {
      handled: false,
      approved: false,
      text: "",
    };
  }

  const text = normalizeText(message);

  const directApproval =
    /^(oui|ok|d accord|je confirme|confirme|valide|je valide|approuve|j approuve)\b/.test(
      text
    );

  const contextualApproval =
    /\b(valide|confirme|approuve)\b.*\b(rendez vous|rdv|evenement|brouillon)\b/.test(
      text
    ) ||
    /\b(oui|ok)\b.*\b(valide|confirme|approuve)\b/.test(text);

  if (!directApproval && !contextualApproval) {
    return {
      handled: false,
      approved: false,
      text: "",
    };
  }

  const draft = state.pendingDraft;
  const title = draft?.title || "Rendez-vous";
  const dateHint = draft?.dateHint ? `, ${draft.dateHint}` : "";
  const timeHint = draft?.timeHint ? ` à ${draft.timeHint}` : "";

  return {
    handled: true,
    approved: true,
    draft,
    text:
      `Validation explicite reçue. Le brouillon « ${title} »${dateHint}${timeHint} est maintenant APPROUVÉ. ` +
      "Aucun événement n'a encore été créé dans Google Calendar : l'écriture réelle reste désactivée.",
  };
}

export function markCalendarDraftApproved(
  state: CalendarApprovalState,
  draft: any
): CalendarApprovalState {
  return {
    pendingDraft: null,
    approvedDraft: draft ?? null,
    updatedAt: new Date().toISOString(),
  };
}
