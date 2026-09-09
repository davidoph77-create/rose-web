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
  eventId?: string;
  htmlLink?: string;
  text: string;
  error?: string;
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

    lastSuccessfulSignature = signature;

    const eventId = typeof data?.id === "string" ? data.id : undefined;
    const htmlLink =
      typeof data?.htmlLink === "string" ? data.htmlLink : undefined;

    return {
      ok: true,
      created: true,
      eventId,
      htmlLink,
      text:
        `C'est fait. L'événement « ${payload.summary} » a été créé dans Google Calendar.` +
        (eventId ? ` ID : ${eventId}.` : ""),
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
