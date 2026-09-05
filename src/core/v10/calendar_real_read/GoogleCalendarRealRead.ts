import { GoogleSignin } from "@react-native-google-signin/google-signin";
import type {
  CalendarReadResult,
  RoseCalendarEvent,
} from "./CalendarRealReadTypes";

const GOOGLE_CALENDAR_EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

const DEFAULT_TIMEOUT_MS = 12000;

function isoNow() {
  return new Date().toISOString();
}

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEvent(item: any): RoseCalendarEvent | null {
  const id = safeString(item?.id);
  const summary = safeString(item?.summary) || "(Sans titre)";

  const startDateTime = safeString(item?.start?.dateTime);
  const startDate = safeString(item?.start?.date);
  const endDateTime = safeString(item?.end?.dateTime);
  const endDate = safeString(item?.end?.date);

  const start = startDateTime || startDate;
  const end = endDateTime || endDate || undefined;

  if (!start) return null;

  return {
    id: id || `${summary}_${start}`,
    summary,
    start,
    end,
    location: safeString(item?.location) || undefined,
    htmlLink: safeString(item?.htmlLink) || undefined,
    allDay: Boolean(startDate && !startDateTime),
  };
}

async function fetchWithTimeout(
  url: string,
  accessToken: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function getFreshAccessToken(): Promise<{
  accessToken?: string;
  refreshed: boolean;
  error?: string;
}> {
  try {
    const signedIn = await GoogleSignin.hasPreviousSignIn();

    if (!signedIn) {
      return {
        refreshed: false,
        error: "Google Calendar is not connected.",
      };
    }

    let tokens = await GoogleSignin.getTokens();

    if (tokens?.accessToken) {
      return {
        accessToken: tokens.accessToken,
        refreshed: false,
      };
    }

    // Safe token refresh path for an already signed-in account.
    // No Calendar write scope is added here.
    try {
      await GoogleSignin.signInSilently();
      tokens = await GoogleSignin.getTokens();
    } catch {
      // fall through to structured error below
    }

    if (!tokens?.accessToken) {
      return {
        refreshed: true,
        error: "No Google access token available.",
      };
    }

    return {
      accessToken: tokens.accessToken,
      refreshed: true,
    };
  } catch (error: any) {
    return {
      refreshed: false,
      error: error?.message || String(error),
    };
  }
}

export async function readUpcomingGoogleCalendarEvents(
  maxResults = 10,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<CalendarReadResult> {
  try {
    const tokenResult = await getFreshAccessToken();

    if (!tokenResult.accessToken) {
      return {
        ok: false,
        events: [],
        error: tokenResult.error || "Google Calendar token unavailable.",
        readOnly: true,
        refreshedToken: tokenResult.refreshed,
      };
    }

    const params = new URLSearchParams({
      timeMin: isoNow(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: String(Math.max(1, Math.min(maxResults, 25))),
    });

    const url = `${GOOGLE_CALENDAR_EVENTS_URL}?${params.toString()}`;

    let response = await fetchWithTimeout(
      url,
      tokenResult.accessToken,
      timeoutMs
    );

    // If Google rejected the token, try one silent refresh and one retry.
    if (response.status === 401) {
      try {
        await GoogleSignin.signInSilently();
        const retryTokens = await GoogleSignin.getTokens();

        if (retryTokens?.accessToken) {
          response = await fetchWithTimeout(
            url,
            retryTokens.accessToken,
            timeoutMs
          );
        }
      } catch {
        // The structured HTTP error below will be returned.
      }
    }

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        events: [],
        error: `Google Calendar HTTP ${response.status}: ${body.slice(0, 240)}`,
        readOnly: true,
        refreshedToken: tokenResult.refreshed || response.status === 401,
      };
    }

    const data = await response.json();

    const events: RoseCalendarEvent[] = (data?.items || [])
      .map(normalizeEvent)
      .filter((event: RoseCalendarEvent | null): event is RoseCalendarEvent =>
        Boolean(event)
      );

    return {
      ok: true,
      events,
      readOnly: true,
      refreshedToken: tokenResult.refreshed,
    };
  } catch (error: any) {
    const isTimeout =
      error?.name === "AbortError" ||
      String(error?.message || "").toLowerCase().includes("aborted");

    return {
      ok: false,
      events: [],
      error: isTimeout
        ? "Google Calendar read timeout."
        : error?.message || String(error),
      readOnly: true,
      refreshedToken: false,
    };
  }
}
