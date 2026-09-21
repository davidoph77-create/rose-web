import { GoogleSignin } from "@react-native-google-signin/google-signin";

export type ControlledCalendarDeleteResult = {
  ok: boolean;
  deleted: boolean;
  verifiedAbsent: boolean;
  eventId: string | null;
  status: number | null;
  text: string;
  error?: string;
};

async function getGoogleAccessToken(): Promise<string | null> {
  const signedIn = await GoogleSignin.hasPreviousSignIn();
  if (!signedIn) return null;

  const tokens = await GoogleSignin.getTokens();
  return tokens?.accessToken || null;
}

/**
 * Rose V10-044D1
 * Controlled real Google Calendar DELETE.
 *
 * Safety contract:
 * - receives ONLY an already-resolved eventId;
 * - does not infer or search for a target;
 * - caller must have obtained explicit user approval;
 * - performs one DELETE, then one verification GET;
 * - no autonomous retry loop.
 */
export async function executeControlledGoogleCalendarDelete(
  eventId: string
): Promise<ControlledCalendarDeleteResult> {
  const safeEventId = String(eventId || "").trim();

  if (!safeEventId) {
    return {
      ok: false,
      deleted: false,
      verifiedAbsent: false,
      eventId: null,
      status: null,
      text: "Suppression bloquee : aucun identifiant d'evenement exact n'est disponible.",
      error: "missing-event-id",
    };
  }

  try {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      return {
        ok: false,
        deleted: false,
        verifiedAbsent: false,
        eventId: safeEventId,
        status: null,
        text: "Je n'ai pas de session Google Calendar active. Aucune suppression n'a ete envoyee.",
        error: "google-not-connected",
      };
    }

    const eventUrl =
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(safeEventId)}`;

    const deleteResponse = await fetch(eventUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (deleteResponse.status !== 204) {
      const body = await deleteResponse.text().catch(() => "");
      return {
        ok: false,
        deleted: false,
        verifiedAbsent: false,
        eventId: safeEventId,
        status: deleteResponse.status,
        text: `Google Calendar n'a pas confirme la suppression (HTTP ${deleteResponse.status}).`,
        error: body || `delete-http-${deleteResponse.status}`,
      };
    }

    const verifyResponse = await fetch(eventUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    let verifiedAbsent = false;

    if (verifyResponse.status === 404 || verifyResponse.status === 410) {
      verifiedAbsent = true;
    } else if (verifyResponse.ok) {
      const verifyBody = await verifyResponse.json().catch(() => null);
      verifiedAbsent = String(verifyBody?.status || "").toLowerCase() === "cancelled";
    }

    if (verifiedAbsent) {
      return {
        ok: true,
        deleted: true,
        verifiedAbsent: true,
        eventId: safeEventId,
        status: 204,
        text: "C'est fait. Le rendez-vous a ete supprime de Google Calendar et son absence a ete verifiee.",
      };
    }

    return {
      ok: true,
      deleted: true,
      verifiedAbsent: false,
      eventId: safeEventId,
      status: 204,
      text: "Google Calendar a accepte la suppression, mais je n'ai pas pu confirmer immediatement l'absence de l'evenement. Je n'envoie aucune deuxieme suppression automatique.",
      error: `verification-http-${verifyResponse.status}`,
    };
  } catch (error: any) {
    return {
      ok: false,
      deleted: false,
      verifiedAbsent: false,
      eventId: safeEventId,
      status: null,
      text: "La suppression Google Calendar a echoue. Aucune nouvelle tentative automatique n'a ete envoyee.",
      error: error?.message || String(error),
    };
  }
}
