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

// V10-044D3B: stabilized READ ONLY Google Calendar account.
// Shared calendars are exposed by Google through this single authorized account.
// No signOut/revokeAccess is performed by the connection flow.
const D3B_PRIMARY_ACCOUNT = "couvr-toit@outlook.fr";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  GoogleSignin.configure({
    scopes: [CALENDAR_READONLY_SCOPE],
    offlineAccess: false,
    accountName: D3B_PRIMARY_ACCOUNT,
  });

  console.log("[ROSE V10-044D3B OAUTH] target account:", D3B_PRIMARY_ACCOUNT);

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

    const connectedEmail =
      signInResult.data?.user?.email?.trim().toLowerCase() || "";
    const expectedEmail = D3B_PRIMARY_ACCOUNT.toLowerCase();

    console.log("[ROSE V10-044D3B OAUTH] connected account:", connectedEmail || "unknown");

    // Safety guard: D3B must never silently use the wrong Google account.
    if (connectedEmail !== expectedEmail) {
      return {
        ok: false,
        error:
          `V10-044D3B: compte Google actif "${connectedEmail || "inconnu"}". ` +
          `Compte attendu "${D3B_PRIMARY_ACCOUNT}". Aucun calendrier n'a été lu.`,
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
