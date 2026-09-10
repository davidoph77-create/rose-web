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

  // V10-043D modifies timed events only.
  // All-day events remain protected until a dedicated implementation exists.
  if (/^\d{4}-\d{2}-\d{2}$/.test(event.start)) {
    throw new Error("Modification des événements journée entière non autorisée dans V10-043D.");
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

  // Use the device's local calendar date. Rose is currently configured for Europe/Paris.
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
    durationMs,
  };
}

async function readBackEvent(accessToken: string, eventId: string) {
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
    `[Rose V10-043D] UPDATE READ-BACK HTTP / status=${response.status} / ok=${response.ok}`
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Google Calendar read-back failed (${response.status}): ${body.slice(0, 300)}`
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
      `[Rose V10-043D] UPDATE START / eventId=${pending.event.id} / oldStart=${pending.event.start} / newStart=${updatedTimes.start}`
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
      `[Rose V10-043D] UPDATE PATCH HTTP / status=${patchResponse.status} / ok=${patchResponse.ok}`
    );

    if (!patchResponse.ok) {
      const body = await patchResponse.text();
      return {
        ok: false,
        updated: false,
        verified: false,
        eventId: pending.event.id,
        text:
          "La modification Google Calendar a échoué. Aucun autre événement n’a été modifié.",
        error: `Google Calendar PATCH failed (${patchResponse.status}): ${body.slice(0, 500)}`,
      };
    }

    const patchedEvent = await patchResponse.json();
    const readBack = await readBackEvent(accessToken, pending.event.id);

    const actualStart =
      readBack?.start?.dateTime ||
      readBack?.start?.date ||
      "";

    const summaryMatches =
      String(readBack?.summary || "").trim() ===
      String(pending.event.summary || "").trim();

    const startMatches = sameInstant(updatedTimes.start, actualStart);
    const verified = summaryMatches && startMatches;

    console.log(
      `[Rose V10-043D] UPDATE VERIFY / summaryMatch=${summaryMatches} / startMatch=${startMatches} / expected=${updatedTimes.start} / actual=${actualStart}`
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
          `Read-back mismatch: summary=${summaryMatches}, start=${startMatches}.`,
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
