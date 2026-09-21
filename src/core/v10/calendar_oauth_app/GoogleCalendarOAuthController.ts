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
  console.log("[ROSE CALENDAR] === START CONNECTION ===");

  const androidClientId = getGoogleAndroidClientId();

  console.log(
    "[ROSE CALENDAR] Android Client ID:",
    androidClientId ? "OK" : "MISSING"
  );

  if (!androidClientId) {
    console.error("[ROSE CALENDAR] Android Client ID absent");

    return {
      ok: false,
      status: "missing-client-id",
      error: "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID is not configured.",
      writeEnabled: false,
    };
  }

  console.log("[ROSE CALENDAR] Configuration OAuth...");

  configureGoogleCalendarOAuth({ androidClientId });

  console.log("[ROSE CALENDAR] Configuration OAuth OK");
  console.log("[ROSE CALENDAR] Starting Google Sign-In...");

  try {
    const result = await connectGoogleCalendarReadOnly();

    console.log("[ROSE CALENDAR] OAuth result:", {
      ok: result?.ok,
      status: result?.status,
      error: result?.error,
      writeEnabled: result?.writeEnabled,
    });

    console.log("[ROSE CALENDAR] === END CONNECTION ===");

    return result;
  } catch (error: any) {
    console.error(
      "[ROSE CALENDAR] OAuth EXCEPTION:",
      error?.message || String(error)
    );

    throw error;
  }
}
export function getGoogleCalendarConnectionStatus() {
  return {
    clientIdConfigured: hasGoogleAndroidClientId(),
    ...getGoogleCalendarOAuthRuntimeStatus(),
    readOnly: true,
    writeEnabled: false,
  };
}
