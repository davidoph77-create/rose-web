import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  getGoogleCalendarOAuthConfig,
  hasGoogleCalendarOAuthClientId,
} from "./GoogleCalendarOAuthConfig";

WebBrowser.maybeCompleteAuthSession();

export type GoogleCalendarOAuthResult = {
  ok: boolean;
  accessToken?: string;
  error?: string;
};

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export async function connectGoogleCalendarReadOnlyOAuth(): Promise<GoogleCalendarOAuthResult> {
  const cfg = getGoogleCalendarOAuthConfig();

  const clientId =
    cfg.androidClientId ||
    cfg.clientId ||
    cfg.webClientId ||
    cfg.iosClientId;

  if (!hasGoogleCalendarOAuthClientId() || !clientId) {
    return {
      ok: false,
      error: "Google OAuth client ID not configured.",
    };
  }

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "roseia",
  });

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
    responseType: AuthSession.ResponseType.Token,
    usePKCE: false,
    extraParams: {
      access_type: "online",
      include_granted_scopes: "true",
      prompt: "consent",
    },
  });

  const result = await request.promptAsync(discovery);

  if (result.type !== "success") {
    return {
      ok: false,
      error: result.type === "error"
        ? (result.params?.error_description || result.params?.error || "Google OAuth failed.")
        : `Google OAuth cancelled (${result.type}).`,
    };
  }

  const accessToken =
    result.authentication?.accessToken ||
    result.params?.access_token;

  if (!accessToken) {
    return {
      ok: false,
      error: "Google OAuth succeeded but no access token was returned.",
    };
  }

  return {
    ok: true,
    accessToken,
  };
}
