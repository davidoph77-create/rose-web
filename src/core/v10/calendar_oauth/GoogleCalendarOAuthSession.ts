import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";

export type GoogleCalendarOAuthResult = {
  ok: boolean;
  accessToken?: string;
  error?: string;
};

const CALENDAR_READONLY_SCOPE =
  "https://www.googleapis.com/auth/calendar.readonly";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  GoogleSignin.configure({
    scopes: [CALENDAR_READONLY_SCOPE],
    offlineAccess: false,
  });

  configured = true;
}

export async function connectGoogleCalendarReadOnlyOAuth(): Promise<GoogleCalendarOAuthResult> {
  try {
    ensureConfigured();

    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const signInResult = await GoogleSignin.signIn();

    if (!isSuccessResponse(signInResult)) {
      return {
        ok: false,
        error: "Connexion Google annulée.",
      };
    }

    const scopeResult = await GoogleSignin.addScopes({
      scopes: [CALENDAR_READONLY_SCOPE],
    });

    if (scopeResult !== null && !isSuccessResponse(scopeResult)) {
      return {
        ok: false,
        error: "Autorisation Google Calendar annulée.",
      };
    }

    const tokens = await GoogleSignin.getTokens();

    if (!tokens?.accessToken) {
      return {
        ok: false,
        error: "Google connecté mais aucun access token Calendar n'a été reçu.",
      };
    }

    return {
      ok: true,
      accessToken: tokens.accessToken,
    };
  } catch (error: any) {
    return {
      ok: false,
      error:
        error?.message ||
        error?.code ||
        "Erreur inconnue pendant la connexion Google Calendar.",
    };
  }
}

export async function disconnectGoogleCalendarOAuth(): Promise<void> {
  try {
    ensureConfigured();
    await GoogleSignin.signOut();
  } catch {
    // Safe no-op.
  }
}
