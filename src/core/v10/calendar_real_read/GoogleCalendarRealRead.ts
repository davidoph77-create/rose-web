import { GoogleSignin } from "@react-native-google-signin/google-signin";
import type {
  CalendarReadResult,
  RoseCalendarEvent,
} from "./CalendarRealReadTypes";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const DEFAULT_TIMEOUT_MS = 12000;

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
      return { refreshed: false, error: "Google Calendar is not connected." };
    }

    let tokens = await GoogleSignin.getTokens();

    if (tokens?.accessToken) {
      return { accessToken: tokens.accessToken, refreshed: false };
    }

    try {
      await GoogleSignin.signInSilently();
      tokens = await GoogleSignin.getTokens();
    } catch {}

    if (!tokens?.accessToken) {
      return { refreshed: true, error: "No Google access token available." };
    }

    return { accessToken: tokens.accessToken, refreshed: true };
  } catch (error: any) {
    return {
      refreshed: false,
      error: error?.message || String(error),
    };
  }
}

async function getJson(
  url: string,
  accessToken: string,
  timeoutMs: number
): Promise<any> {
  let response = await fetchWithTimeout(url, accessToken, timeoutMs);

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
    } catch {}
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Google Calendar HTTP ${response.status}: ${body.slice(0, 240)}`
    );
  }

  return response.json();
}

function normalizeEvent(
  item: any,
  calendar: { id: string; summary: string }
): RoseCalendarEvent | null {
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
    id: `${calendar.id}:${id || `${summary}_${start}`}`,
    summary,
    start,
    end,
    location: safeString(item?.location) || undefined,
    htmlLink: safeString(item?.htmlLink) || undefined,
    allDay: Boolean(startDate && !startDateTime),
    calendarId: calendar.id,
    calendarName: calendar.summary,
  };
}

export async function readUpcomingGoogleCalendarEvents(
  maxResults = 20,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<CalendarReadResult> {
  try {
    const currentUser = GoogleSignin.getCurrentUser();
    const activeEmail =
      currentUser?.user?.email?.trim().toLowerCase() || "unknown";

    console.log("[ROSE V10-044D3B CALENDAR] active account:", activeEmail);

    const tokenResult = await getFreshAccessToken();

    console.log("[ROSE V10-044D3B CALENDAR] token:", {
      available: Boolean(tokenResult.accessToken),
      refreshed: tokenResult.refreshed,
      error: tokenResult.error,
    });

    if (!tokenResult.accessToken) {
      return {
        ok: false,
        events: [],
        error: tokenResult.error || "Google Calendar token unavailable.",
        readOnly: true,
        refreshedToken: tokenResult.refreshed,
      };
    }

    // READ ONLY: list all visible calendars available to the connected account.
    const calendarListUrl =
      `${GOOGLE_CALENDAR_API}/users/me/calendarList?` +
      new URLSearchParams({
        minAccessRole: "reader",
        showDeleted: "false",
        showHidden: "false",
        maxResults: "100",
      }).toString();

    const listData = await getJson(
      calendarListUrl,
      tokenResult.accessToken,
      timeoutMs
    );

    const calendars: { id: string; summary: string }[] = (
      listData?.items || []
    )
      .map((item: any) => ({
        id: safeString(item?.id),
        summary: safeString(item?.summary) || "(Agenda Google)",
      }))
      .filter((calendar: { id: string }) => Boolean(calendar.id));

    console.log("[ROSE V10-044D3B CALENDAR] calendars:", calendars.length);

    const allEvents: RoseCalendarEvent[] = [];
    const perCalendarLimit = Math.max(1, Math.min(maxResults, 25));

    for (const calendar of calendars) {
      const params = new URLSearchParams({
        timeMin: new Date().toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: String(perCalendarLimit),
      });

      const url =
        `${GOOGLE_CALENDAR_API}/calendars/` +
        `${encodeURIComponent(calendar.id)}/events?${params.toString()}`;

      try {
        const data = await getJson(url, tokenResult.accessToken, timeoutMs);

        const events: RoseCalendarEvent[] = (data?.items || [])
          .map((item: any) => normalizeEvent(item, calendar))
          .filter(
            (event: RoseCalendarEvent | null): event is RoseCalendarEvent =>
              Boolean(event)
          );

        console.log(
          `[ROSE V10-044D3B CALENDAR] ${calendar.summary}:`,
          events.length
        );

        allEvents.push(...events);
      } catch (calendarError: any) {
        console.log(
          `[ROSE V10-044D3B CALENDAR] skipped ${calendar.summary}:`,
          calendarError?.message || String(calendarError)
        );
      }
    }

    allEvents.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    return {
      ok: true,
      events: allEvents.slice(0, Math.max(1, maxResults)),
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
