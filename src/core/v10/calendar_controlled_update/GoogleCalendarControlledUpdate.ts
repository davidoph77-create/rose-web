import { GoogleSignin } from "@react-native-google-signin/google-signin";
import type { PendingCalendarUpdate } from "../calendar_update_approval";

export type ControlledCalendarUpdateResult = {
  ok: boolean;
  updated: boolean;
  verified: boolean;
  eventId?: string;
  text: string;
  error?: string;
};

const consumedUpdateKeys = new Set<string>();

function normalizeText(value?: string) {
  return String(value || "").trim();
}

function parseTimeToMinutes(value?: string): number | null {
  if (!value) return null;

  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const match = normalized.match(/(\d{1,2})(?:\s*(?:h|:)\s*(\d{1,2}))?/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2] || 0);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
}

function sameInstant(a?: string, b?: string) {
  if (!a || !b) return false;

  const ams = Date.parse(a);
  const bms = Date.parse(b);

  if (Number.isNaN(ams) || Number.isNaN(bms)) {
    return a === b;
  }

  return ams === bms;
}

function buildUpdatedTimes(pending: PendingCalendarUpdate) {
  const event = pending.event;
  const newMinutes = parseTimeToMinutes(pending.draft.newTime);

  if (newMinutes === null) {
    throw new Error("Nouvelle heure invalide.");
  }

  if (!event.start) {
    throw new Error("Heure de début actuelle absente.");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(event.start)) {
    throw new Error(
      "Modification des événements journée entière non autorisée dans V10-043E1."
    );
  }

  const oldStart = new Date(event.start);
  if (Number.isNaN(oldStart.getTime())) {
    throw new Error("Date de début actuelle invalide.");
  }

  const oldEnd = event.end ? new Date(event.end) : null;
  const durationMs =
    oldEnd && !Number.isNaN(oldEnd.getTime())
      ? Math.max(5 * 60 * 1000, oldEnd.getTime() - oldStart.getTime())
      : 60 * 60 * 1000;

  const newStart = new Date(oldStart);
  newStart.setHours(
    Math.floor(newMinutes / 60),
    newMinutes % 60,
    0,
    0
  );

  const newEnd = new Date(newStart.getTime() + durationMs);

  return {
    start: newStart.toISOString(),
    end: newEnd.toISOString(),
  };
}

async function getEvent(accessToken: string, eventId: string, label: string) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  console.log(
    `[Rose V10-043E1] ${label} / status=${response.status} / ok=${response.ok}`
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Google Calendar GET failed (${response.status}): ${body.slice(0, 300)}`
    );
  }

  return response.json();
}

export async function executeControlledGoogleCalendarUpdate(
  pending: PendingCalendarUpdate
): Promise<ControlledCalendarUpdateResult> {
  try {
    if (!pending?.event?.id) {
      return {
        ok: false,
        updated: false,
        verified: false,
        text:
          "Modification refusée : aucun eventId Google Calendar fiable n’est disponible.",
        error: "Missing eventId.",
      };
    }

    if (!pending?.draft?.newTime) {
      return {
        ok: false,
        updated: false,
        verified: false,
        eventId: pending.event.id,
        text:
          "Modification refusée : la nouvelle heure n’est pas suffisamment définie.",
        error: "Missing newTime.",
      };
    }

    const oneShotKey = [
      pending.event.id,
      pending.event.start || "",
      pending.draft.newTime || "",
    ].join("|");

    if (consumedUpdateKeys.has(oneShotKey)) {
      return {
        ok: false,
        updated: false,
        verified: false,
        eventId: pending.event.id,
        text:
          "Cette validation de modification a déjà été utilisée. Aucun second PATCH n’a été envoyé.",
        error: "Update approval already consumed.",
      };
    }

    const signedIn = await GoogleSignin.hasPreviousSignIn();
    if (!signedIn) {
      return {
        ok: false,
        updated: false,
        verified: false,
        eventId: pending.event.id,
        text:
          "Modification impossible : Google Calendar n’est pas connecté.",
        error: "Google Calendar is not connected.",
      };
    }

    const tokens = await GoogleSignin.getTokens();
    const accessToken = tokens?.accessToken;

    if (!accessToken) {
      return {
        ok: false,
        updated: false,
        verified: false,
        eventId: pending.event.id,
        text:
          "Modification impossible : aucun jeton Google Calendar n’est disponible.",
        error: "No Google access token available.",
      };
    }

    // PRE-PATCH safety check: re-read the exact resolved event and verify it has not changed.
    const preflight = await getEvent(
      accessToken,
      pending.event.id,
      "UPDATE PREFLIGHT GET"
    );

    const preflightSummary = normalizeText(preflight?.summary);
    const expectedSummary = normalizeText(pending.event.summary);

    const actualStart =
      preflight?.start?.dateTime ||
      preflight?.start?.date ||
      "";

    const actualEnd =
      preflight?.end?.dateTime ||
      preflight?.end?.date ||
      "";

    const summaryMatch = preflightSummary === expectedSummary;
    const startMatch = sameInstant(pending.event.start, actualStart);
    const endMatch =
      !pending.event.end || sameInstant(pending.event.end, actualEnd);
    const active = String(preflight?.status || "confirmed") !== "cancelled";

    console.log(
      `[Rose V10-043E1] UPDATE PREFLIGHT VERIFY / summaryMatch=${summaryMatch} / startMatch=${startMatch} / endMatch=${endMatch} / active=${active}`
    );

    if (!summaryMatch || !startMatch || !endMatch || !active) {
      return {
        ok: false,
        updated: false,
        verified: false,
        eventId: pending.event.id,
        text:
          "Modification bloquée : le rendez-vous Google Calendar a changé depuis son identification. Aucun PATCH n’a été envoyé.",
        error:
          `Preflight mismatch: summary=${summaryMatch}, start=${startMatch}, end=${endMatch}, active=${active}.`,
      };
    }

    // Consume the approval BEFORE the network write, so the same approval cannot be replayed.
    consumedUpdateKeys.add(oneShotKey);

    const updatedTimes = buildUpdatedTimes(pending);

    const payload = {
      start: {
        dateTime: updatedTimes.start,
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: updatedTimes.end,
        timeZone: "Europe/Paris",
      },
    };

    console.log(
      `[Rose V10-043E1] UPDATE START / eventId=${pending.event.id} / oldStart=${pending.event.start} / newStart=${updatedTimes.start}`
    );

    const patchResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(pending.event.id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log(
      `[Rose V10-043E1] UPDATE PATCH HTTP / status=${patchResponse.status} / ok=${patchResponse.ok}`
    );

    if (!patchResponse.ok) {
      const body = await patchResponse.text();
      return {
        ok: false,
        updated: false,
        verified: false,
        eventId: pending.event.id,
        text:
          "La modification Google Calendar a échoué. La validation a été consommée pour éviter toute répétition automatique.",
        error: `Google Calendar PATCH failed (${patchResponse.status}): ${body.slice(0, 500)}`,
      };
    }

    await patchResponse.json();

    const readBack = await getEvent(
      accessToken,
      pending.event.id,
      "UPDATE READ-BACK HTTP"
    );

    const readBackStart =
      readBack?.start?.dateTime ||
      readBack?.start?.date ||
      "";

    const summaryMatches =
      normalizeText(readBack?.summary) === expectedSummary;

    const finalStartMatches = sameInstant(updatedTimes.start, readBackStart);
    const verified = summaryMatches && finalStartMatches;

    console.log(
      `[Rose V10-043E1] UPDATE VERIFY / summaryMatch=${summaryMatches} / startMatch=${finalStartMatches} / expected=${updatedTimes.start} / actual=${readBackStart}`
    );

    if (!verified) {
      return {
        ok: false,
        updated: true,
        verified: false,
        eventId: pending.event.id,
        text:
          `Le rendez-vous « ${pending.event.summary} » a reçu la modification, mais la relecture Google Calendar ne correspond pas exactement au résultat attendu. Vérification manuelle conseillée.`,
        error:
          `Read-back mismatch: summary=${summaryMatches}, start=${finalStartMatches}.`,
      };
    }

    return {
      ok: true,
      updated: true,
      verified: true,
      eventId: pending.event.id,
      text:
        `C’est fait. Le rendez-vous « ${pending.event.summary} » a été modifié de ${pending.draft.oldTime ?? "l’ancienne heure"} à ${pending.draft.newTime} puis vérifié dans Google Calendar.`,
    };
  } catch (error: any) {
    return {
      ok: false,
      updated: false,
      verified: false,
      eventId: pending?.event?.id,
      text:
        "La modification Google Calendar a échoué. Aucun DELETE n’a été exécuté.",
      error: error?.message || String(error),
    };
  }
}
