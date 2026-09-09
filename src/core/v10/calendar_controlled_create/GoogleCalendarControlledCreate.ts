import { GoogleSignin } from "@react-native-google-signin/google-signin";

const GOOGLE_CALENDAR_EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

const GOOGLE_CALENDAR_WRITE_SCOPE =
  "https://www.googleapis.com/auth/calendar.events";

const DEFAULT_TIMEOUT_MS = 12000;

type AnyPayload = Record<string, any>;

export type ControlledCalendarCreateResult = {
  ok: boolean;
  created: boolean;
  verified?: boolean;
  eventId?: string;
  htmlLink?: string;
  text: string;
  error?: string;
  verificationError?: string;
  verificationDiagnostic?: string;
};

let inFlight = false;
let lastSuccessfulSignature = "";

function stableSignature(payload: AnyPayload) {
  return JSON.stringify({
    summary: payload?.summary ?? "",
    start: payload?.start ?? null,
    end: payload?.end ?? null,
    location: payload?.location ?? "",
    description: payload?.description ?? "",
  });
}

function extractPayload(gateState: any): AnyPayload | null {
  const candidates = [
    gateState?.approvedPayload,
    gateState?.payload,
    gateState?.calendarPayload,
    gateState?.preparedPayload,
    gateState?.approvedCalendarPayload,
  ];

  return candidates.find((item) => item && typeof item === "object") ?? null;
}

function normalizePayload(payload: AnyPayload): AnyPayload {
  const normalized: AnyPayload = {
    summary: String(payload?.summary ?? payload?.title ?? "Rendez-vous").trim(),
    start: payload?.start,
    end: payload?.end,
  };

  if (payload?.location) normalized.location = String(payload.location);
  if (payload?.description) normalized.description = String(payload.description);

  return normalized;
}

function validatePayload(payload: AnyPayload) {
  if (!payload?.summary) return "Titre Calendar manquant.";
  if (!payload?.start) return "Début Calendar manquant.";
  if (!payload?.end) return "Fin Calendar manquante.";

  const startValue = payload.start?.dateTime ?? payload.start?.date;
  const endValue = payload.end?.dateTime ?? payload.end?.date;

  if (!startValue) return "Date/heure de début invalide.";
  if (!endValue) return "Date/heure de fin invalide.";

  return "";
}

async function fetchWithTimeout(
  url: string,
  accessToken: string,
  body: AnyPayload,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function sameCalendarInstant(expectedValue: unknown, actualValue: unknown) {
  const expected = String(expectedValue ?? "").trim();
  const actual = String(actualValue ?? "").trim();

  if (!expected || !actual) return false;

  // All-day Calendar values are semantic dates, not clock instants.
  const expectedDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(expected);
  const actualDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(actual);

  if (expectedDateOnly || actualDateOnly) {
    return expected === actual;
  }

  const expectedMs = Date.parse(expected);
  const actualMs = Date.parse(actual);

  if (Number.isNaN(expectedMs) || Number.isNaN(actualMs)) {
    return expected === actual;
  }

  return expectedMs === actualMs;
}
async function verifyCreatedEvent(
  accessToken: string,
  eventId: string,
  expectedPayload: AnyPayload,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const encodedEventId = encodeURIComponent(eventId);
    const readBackUrl = `${GOOGLE_CALENDAR_EVENTS_URL}/${encodedEventId}`;

    console.log(
      `[Rose V10-042L] READ-BACK START / eventId=${eventId}`
    );

    const response = await fetch(readBackUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    const bodyText = await response.text();
    let data: any = {};

    try {
      data = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      data = {};
    }

    console.log(
      `[Rose V10-042L] READ-BACK HTTP / status=${response.status} / ok=${response.ok}`
    );

    if (!response.ok) {
      const diagnostic =
        `HTTP ${response.status} / body=${bodyText.slice(0, 300)}`;

      console.log(
        `[Rose V10-042L] READ-BACK FAILED / ${diagnostic}`
      );

      return {
        verified: false,
        reason: "http-error",
        diagnostic,
        error: `Google Calendar read-back ${diagnostic}`,
      };
    }

    const expectedSummary = String(expectedPayload?.summary ?? "").trim();
    const actualSummary = String(data?.summary ?? "").trim();

    const expectedStart =
      expectedPayload?.start?.dateTime ?? expectedPayload?.start?.date ?? "";
    const actualStart =
      data?.start?.dateTime ?? data?.start?.date ?? "";

    const summaryMatches = actualSummary === expectedSummary;
    const startMatches = sameCalendarInstant(expectedStart, actualStart);

    const diagnostic =
      `summary expected="${expectedSummary}" actual="${actualSummary}" match=${summaryMatches}; ` +
      `start expected="${expectedStart}" actual="${actualStart}" semanticMatch=${startMatches}`;

    console.log(
      `[Rose V10-042M] READ-BACK COMPARE / ${diagnostic}`
    );

    if (!summaryMatches || !startMatches) {
      return {
        verified: false,
        reason: "mismatch",
        diagnostic,
        error:
          `Google Calendar read-back mismatch: ` +
          `summary=${summaryMatches ? "ok" : "different"}, ` +
          `start=${startMatches ? "ok" : "different"}.`,
      };
    }

    console.log(
      `[Rose V10-042M] READ-BACK VERIFIED / eventId=${eventId}`
    );

    return {
      verified: true,
      reason: "verified",
      diagnostic,
      event: data,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function getWriteAccessToken() {
  // Rose V10-042J - initialize the native Google Sign-In client before
  // addScopes(). The original GoogleSignin API requires configure() first.
  // No server/offline token is requested here.
  GoogleSignin.configure({
    scopes: [GOOGLE_CALENDAR_WRITE_SCOPE],
    offlineAccess: false,
  });

  const signedIn = await GoogleSignin.hasPreviousSignIn();
  if (!signedIn) {
    throw new Error("Google Calendar n'est pas connecté.");
  }

  // This write scope is requested ONLY after Rose's final explicit create gate.
  await GoogleSignin.addScopes({
    scopes: [GOOGLE_CALENDAR_WRITE_SCOPE],
  });

  let tokens = await GoogleSignin.getTokens();

  if (!tokens?.accessToken) {
    await GoogleSignin.signInSilently();
    tokens = await GoogleSignin.getTokens();
  }

  if (!tokens?.accessToken) {
    throw new Error("Aucun jeton Google autorisé pour Calendar.");
  }

  return tokens.accessToken;
}

export async function executeControlledGoogleCalendarCreate(
  gateState: any,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<ControlledCalendarCreateResult> {
  if (!(gateState?.gateAuthorized === true || gateState?.authorized === true)) {
    return {
      ok: false,
      created: false,
      text: "Création refusée : la confirmation finale explicite n'est pas autorisée.",
    };
  }

  const rawPayload = extractPayload(gateState);
  if (!rawPayload) {
    return {
      ok: false,
      created: false,
      text: "Création refusée : aucun payload Google Calendar approuvé n'est disponible.",
    };
  }

  const payload = normalizePayload(rawPayload);
  const validationError = validatePayload(payload);

  if (validationError) {
    return {
      ok: false,
      created: false,
      text: `Création refusée : ${validationError}`,
    };
  }

  const signature = stableSignature(payload);

  if (inFlight) {
    return {
      ok: false,
      created: false,
      text: "Une création Google Calendar est déjà en cours. Aucun second événement n'a été envoyé.",
    };
  }

  if (lastSuccessfulSignature === signature) {
    return {
      ok: false,
      created: false,
      text: "Cet événement vient déjà d'être créé pendant cette session. Aucun doublon n'a été envoyé.",
    };
  }

  inFlight = true;

  try {
    const accessToken = await getWriteAccessToken();
    const response = await fetchWithTimeout(
      GOOGLE_CALENDAR_EVENTS_URL,
      accessToken,
      payload,
      timeoutMs
    );

    const bodyText = await response.text();
    let data: any = {};

    try {
      data = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      return {
        ok: false,
        created: false,
        error: `Google Calendar HTTP ${response.status}: ${bodyText.slice(0, 300)}`,
        text: `Google Calendar a refusé la création (HTTP ${response.status}). Aucun succès n'est enregistré.`,
      };
    }

    const eventId = typeof data?.id === "string" ? data.id : undefined;
    const htmlLink =
      typeof data?.htmlLink === "string" ? data.htmlLink : undefined;

    // V10-042K - the POST succeeded, but Rose verifies the created event
    // by reading the exact event ID back from Google Calendar.
    if (!eventId) {
      lastSuccessfulSignature = signature;
      return {
        ok: true,
        created: true,
        verified: false,
        htmlLink,
        verificationError: "Google Calendar n'a pas retourné d'identifiant d'événement.",
        text:
          `L'événement « ${payload.summary} » a été créé, mais je ne peux pas ` +
          `confirmer sa relecture car Google Calendar n'a pas retourné son identifiant.`,
      };
    }

    let verification: any;
    try {
      verification = await verifyCreatedEvent(
        accessToken,
        eventId,
        payload,
        timeoutMs
      );
    } catch (verificationError: any) {
      const diagnostic =
        verificationError?.name === "AbortError"
          ? "Google Calendar read-back timeout."
          : verificationError?.message || String(verificationError);

      console.log(
        `[Rose V10-042L] READ-BACK EXCEPTION / ${diagnostic}`
      );

      verification = {
        verified: false,
        reason: "exception",
        diagnostic,
        error: diagnostic,
      };
    }

    // Creation is already real at this point. Preserve duplicate protection
    // even if the independent read-back verification fails.
    lastSuccessfulSignature = signature;

    if (!verification?.verified) {
      const verificationDiagnostic =
        verification?.diagnostic ||
        verification?.error ||
        "Read-back verification failed.";

      console.log(
        `[Rose V10-042M] VERIFICATION RESULT / verified=false / ${verificationDiagnostic}`
      );

      return {
        ok: true,
        created: true,
        verified: false,
        eventId,
        htmlLink,
        error: verification?.error || "Read-back verification failed.",
        verificationError: verification?.error || "Read-back verification failed.",
        verificationDiagnostic,
        text:
          `L'événement « ${payload.summary} » a bien été créé dans Google Calendar, ` +
          `mais sa vérification par relecture n'a pas pu être confirmée. ` +
          `Diagnostic : ${verification?.error || verificationDiagnostic}. ID : ${eventId}.`,
      };
    }

    console.log(
      `[Rose V10-042M] VERIFICATION RESULT / verified=true / eventId=${eventId}`
    );

    return {
      ok: true,
      created: true,
      verified: true,
      eventId,
      htmlLink,
      verificationDiagnostic: verification?.diagnostic,
      text:
        `C'est fait. L'événement « ${payload.summary} » a été créé puis vérifié ` +
        `dans Google Calendar. ID : ${eventId}.`,
    };
  } catch (error: any) {
    const isTimeout =
      error?.name === "AbortError" ||
      String(error?.message ?? "").toLowerCase().includes("aborted");

    return {
      ok: false,
      created: false,
      error: isTimeout
        ? "Google Calendar create timeout."
        : error?.message || String(error),
      text: isTimeout
        ? "La création Google Calendar a expiré. Je ne confirme pas la création afin d'éviter un doublon."
        : `La création Google Calendar a échoué : ${error?.message || String(error)}`,
    };
  } finally {
    inFlight = false;
  }
}

