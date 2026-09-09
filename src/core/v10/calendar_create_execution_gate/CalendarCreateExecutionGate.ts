export type CalendarExecutionGateState = {
  approvedPayload: any | null;
  gateAuthorized: boolean;
  updatedAt: string | null;
};

export type CalendarExecutionGateResult = {
  handled: boolean;
  authorized: boolean;
  payloadReady: boolean;
  text: string;
  payload?: any;
};

export function createCalendarExecutionGateState(): CalendarExecutionGateState {
  return {
    approvedPayload: null,
    gateAuthorized: false,
    updatedAt: null,
  };
}

export function storeApprovedCalendarPayload(
  state: CalendarExecutionGateState,
  payload: any
): CalendarExecutionGateState {
  return {
    approvedPayload: payload ?? null,
    gateAuthorized: false,
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

function isFinalCreateConfirmation(message: string) {
  const text = normalizeText(message);

  return (
    /^cree le maintenant\b/.test(text) ||
    /^cree maintenant\b/.test(text) ||
    /^creer maintenant\b/.test(text) ||
    /^vas y cree le\b/.test(text) ||
    /^oui cree le maintenant\b/.test(text) ||
    /\bcree\b.*\bmaintenant\b/.test(text)
  );
}

export function evaluateCalendarCreateExecutionGate(
  message: string,
  state: CalendarExecutionGateState
): CalendarExecutionGateResult {
  if (!state?.approvedPayload) {
    return {
      handled: false,
      authorized: false,
      payloadReady: false,
      text: "",
    };
  }

  if (!isFinalCreateConfirmation(message)) {
    return {
      handled: false,
      authorized: false,
      payloadReady: true,
      text: "",
    };
  }

  return {
    handled: true,
    authorized: true,
    payloadReady: true,
    payload: state.approvedPayload,
    text:
      "Confirmation finale reçue. La porte d'exécution Calendar est AUTORISÉE pour ce payload approuvé. " +
      "À cette étape, le POST Google Calendar reste volontairement désactivé : aucun événement n'a encore été créé.",
  };
}

export function markCalendarExecutionGateAuthorized(
  state: CalendarExecutionGateState
): CalendarExecutionGateState {
  return {
    ...state,
    gateAuthorized: true,
    updatedAt: new Date().toISOString(),
  };
}
