import { GoogleSignin } from "@react-native-google-signin/google-signin";

export type ControlledCalendarDeleteInput = {
  approved: boolean;
  eventId: string;
};

export type ControlledCalendarDeleteResult = {
  ok: boolean;
  deleted: boolean;
  verifiedAbsent: boolean;
  status?: number;
  verifyStatus?: number;
  text: string;
  error?: string;
};

/**
 * Rose V10-044D - controlled REAL Google Calendar DELETE.
 *
 * Security invariants:
 * - never runs unless approved === true;
 * - requires an already-resolved concrete Google Calendar eventId;
 * - deletes only that exact eventId from the primary calendar;
 * - verifies absence with a GET after DELETE;
 * - no autonomous selection, no fuzzy lookup, no bulk delete.
 */
export async function executeControlledGoogleCalendarDelete(
  input: ControlledCalendarDeleteInput
): Promise<ControlledCalendarDeleteResult> {
  const eventId = String(input?.eventId ?? "").trim();

  if (input?.approved !== true) {
    return {
      ok: false,
      deleted: false,
      verifiedAbsent: false,
      text: "Suppression bloquée : une confirmation explicite est obligatoire.",
      error: "explicit-approval-required",
    };
  }

  if (!eventId) {
    return {
      ok: false,
      deleted: false,
      verifiedAbsent: false,
      text: "Suppression bloquée : aucun événement Google Calendar précis n'est identifié.",
      error: "missing-event-id",
    };
  }

  try {
    const signedIn = await GoogleSignin.hasPreviousSignIn();
    if (!signedIn) {
      return {
        ok: false,
        deleted: false,
        verifiedAbsent: false,
        text: "Je ne peux pas supprimer cet événement car Google Calendar n'est pas connecté.",
        error: "google-not-connected",
      };
    }

    const tokens = await GoogleSignin.getTokens();
    const accessToken = tokens?.accessToken;

    if (!accessToken) {
      return {
        ok: false,
        deleted: false,
        verifiedAbsent: false,
        text: "Je n'ai pas de jeton Google valide. Aucune suppression n'a été envoyée.",
        error: "missing-google-access-token",
      };
    }

    const eventUrl =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events/" +
      encodeURIComponent(eventId);

    console.log(
      `[Rose V10-044D] DELETE HTTP SEND / eventId=${eventId} / explicitApproval=true`
    );

    const response = await fetch(eventUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    // 204 = normal successful Calendar API delete.
    // 404/410 = already absent/deleted; safe idempotent success.
    if (response.status !== 204 && response.status !== 404 && response.status !== 410) {
      let details = "";
      try {
        details = await response.text();
      } catch {
        details = "";
      }

      return {
        ok: false,
        deleted: false,
        verifiedAbsent: false,
        status: response.status,
        text: `Google Calendar a refusé la suppression (HTTP ${response.status}). L'événement n'est pas considéré comme supprimé.`,
        error: details || `delete-http-${response.status}`,
      };
    }

    console.log(
      `[Rose V10-044D] DELETE HTTP RESULT / status=${response.status} / eventId=${eventId}`
    );

    const verifyResponse = await fetch(eventUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const verifiedAbsent =
      verifyResponse.status === 404 || verifyResponse.status === 410;

    console.log(
      `[Rose V10-044D] DELETE VERIFY / status=${verifyResponse.status} / absent=${verifiedAbsent} / eventId=${eventId}`
    );

    if (!verifiedAbsent) {
      return {
        ok: false,
        deleted: response.status === 204 || response.status === 404 || response.status === 410,
        verifiedAbsent: false,
        status: response.status,
        verifyStatus: verifyResponse.status,
        text: "La demande de suppression a été envoyée, mais Rose n'a pas pu confirmer que l'événement a réellement disparu. Vérifie Google Calendar avant toute nouvelle tentative.",
        error: `delete-verification-http-${verifyResponse.status}`,
      };
    }

    return {
      ok: true,
      deleted: true,
      verifiedAbsent: true,
      status: response.status,
      verifyStatus: verifyResponse.status,
      text: "C'est fait. Le rendez-vous a été supprimé de Google Calendar et Rose a vérifié qu'il n'est plus présent.",
    };
  } catch (error: any) {
    return {
      ok: false,
      deleted: false,
      verifiedAbsent: false,
      text: "La suppression Google Calendar a échoué. Rose n'effectuera aucune autre tentative automatiquement.",
      error: error?.message || String(error),
    };
  }
}
