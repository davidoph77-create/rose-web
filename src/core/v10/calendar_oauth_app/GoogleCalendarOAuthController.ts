import {
  configureGoogleCalendarOAuth,
  connectGoogleCalendarReadOnly,
  getGoogleCalendarOAuthRuntimeStatus,
} from "../calendar_oauth";
import {
  getGoogleAndroidClientId,
  hasGoogleAndroidClientId,
} from "./GoogleCalendarOAuthEnv";

export async function connectGoogleCalendarFromApp() {
  const androidClientId = getGoogleAndroidClientId();

  if (!androidClientId) {
    return {
      ok: false,
      status: "missing-client-id",
      error: "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID is not configured.",
      writeEnabled: false,
    };
  }

  configureGoogleCalendarOAuth({ androidClientId });
  return connectGoogleCalendarReadOnly();
}

export function getGoogleCalendarConnectionStatus() {
  return {
    clientIdConfigured: hasGoogleAndroidClientId(),
    ...getGoogleCalendarOAuthRuntimeStatus(),
    readOnly: true,
    writeEnabled: false,
  };
}
