export type CalendarDeleteApprovalState = {
  pending: null | {
    eventId: string;
    label: string;
    createdAt: string;
  };
  approvedEventId: string | null;
};

export type CalendarDeleteApprovalResult = {
  handled: boolean;
  approved: boolean;
  cancelled: boolean;
  eventId?: string;
  text: string;
};

export function createCalendarDeleteApprovalState(): CalendarDeleteApprovalState {
  return { pending: null, approvedEventId: null };
}

export function rememberPendingCalendarDelete(
  state: CalendarDeleteApprovalState,
  event: any
): CalendarDeleteApprovalState {
  const eventId = String(event?.id ?? "").trim();
  if (!eventId) return state;

  const label = String(
    event?.summary ?? event?.title ?? event?.name ?? "cet evenement"
  ).trim();

  return {
    ...state,
    pending: {
      eventId,
      label: label || "cet evenement",
      createdAt: new Date().toISOString(),
    },
    approvedEventId: null,
  };
}

function normalize(value: string): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.,!?;:()\[\]{}"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function handleCalendarDeleteApproval(
  message: string,
  state: CalendarDeleteApprovalState
): CalendarDeleteApprovalResult {
  if (!state.pending) {
    return {
      handled: false,
      approved: false,
      cancelled: false,
      text: "",
    };
  }

  const normalized = normalize(message);

  const cancelPhrases = [
    "non",
    "annule",
    "annuler",
    "laisse tomber",
    "ne supprime pas",
    "garde le",
  ];

  if (cancelPhrases.some((phrase) => normalized === phrase || normalized.includes(phrase))) {
    return {
      handled: true,
      approved: false,
      cancelled: true,
      eventId: state.pending.eventId,
      text: `D'accord. J'annule la demande de suppression de « ${state.pending.label} ». Aucune suppression n'a ete envoyee a Google Calendar.`,
    };
  }

  const explicitApprovals = [
    "oui je confirme",
    "je confirme",
    "confirme la suppression",
    "oui supprime",
    "oui supprimer",
    "supprime le",
    "supprime la",
  ];

  const approved = explicitApprovals.some(
    (phrase) => normalized === phrase || normalized.includes(phrase)
  );

  if (!approved) {
    return {
      handled: false,
      approved: false,
      cancelled: false,
      text: "",
    };
  }

  return {
    handled: true,
    approved: true,
    cancelled: false,
    eventId: state.pending.eventId,
    text: `Confirmation recue pour supprimer « ${state.pending.label} ». V10-044C n'envoie encore aucune suppression reelle a Google Calendar. L'evenement reste intact.`,
  };
}

export function markCalendarDeleteApproved(
  state: CalendarDeleteApprovalState
): CalendarDeleteApprovalState {
  if (!state.pending) return state;
  return {
    ...state,
    approvedEventId: state.pending.eventId,
    pending: null,
  };
}

export function clearPendingCalendarDelete(
  state: CalendarDeleteApprovalState
): CalendarDeleteApprovalState {
  return {
    ...state,
    pending: null,
    approvedEventId: null,
  };
}
