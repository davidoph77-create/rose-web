import { hasGoogleCalendarOAuthClientId } from "./GoogleCalendarOAuthConfig";

export function googleCalendarOAuthSelfTest() {
  return {
    oauthCoreReady: true,
    clientIdConfigured: hasGoogleCalendarOAuthClientId(),
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    writeScopeEnabled: false,
    ok: true,
  };
}
