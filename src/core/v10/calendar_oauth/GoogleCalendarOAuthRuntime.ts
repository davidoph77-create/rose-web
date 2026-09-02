import { installGoogleCalendarReadOnlyProvider } from "../calendar_readonly/CalendarReadOnlyRuntime";
import { connectGoogleCalendarReadOnlyOAuth } from "./GoogleCalendarOAuthSession";

let lastStatus: "idle" | "connected" | "error" = "idle";
let lastError: string | undefined;

export async function connectGoogleCalendarReadOnly() {
  const result = await connectGoogleCalendarReadOnlyOAuth();

  if (!result.ok || !result.accessToken) {
    lastStatus = "error";
    lastError = result.error;
    return {
      ok: false,
      status: lastStatus,
      error: lastError,
      writeEnabled: false,
    };
  }

  installGoogleCalendarReadOnlyProvider(result.accessToken);
  lastStatus = "connected";
  lastError = undefined;

  return {
    ok: true,
    status: lastStatus,
    error: undefined,
    writeEnabled: false,
  };
}

export function getGoogleCalendarOAuthRuntimeStatus() {
  return {
    status: lastStatus,
    error: lastError,
    readOnly: true,
    writeEnabled: false,
  };
}
