import { GoogleSignin } from "@react-native-google-signin/google-signin";
import type { CalendarReadResult, RoseCalendarEvent } from "./CalendarRealReadTypes";

function isoNow() {
  return new Date().toISOString();
}

export async function readUpcomingGoogleCalendarEvents(
  maxResults = 10
): Promise<CalendarReadResult> {
  try {
    const signedIn = await GoogleSignin.hasPreviousSignIn();
    if (!signedIn) {
      return {
        ok: false,
        events: [],
        error: "Google Calendar is not connected.",
        readOnly: true,
      };
    }

    const tokens = await GoogleSignin.getTokens();
    const accessToken = tokens?.accessToken;

    if (!accessToken) {
      return {
        ok: false,
        events: [],
        error: "No Google access token available.",
        readOnly: true,
      };
    }

    const params = new URLSearchParams({
      timeMin: isoNow(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: String(Math.max(1, Math.min(maxResults, 25))),
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        events: [],
        error: `Google Calendar HTTP ${response.status}: ${body.slice(0, 240)}`,
        readOnly: true,
      };
    }

    const data = await response.json();
    const events: RoseCalendarEvent[] = (data?.items || []).map((item: any) => ({
      id: String(item?.id || ""),
      summary: String(item?.summary || "(Sans titre)"),
      start: String(item?.start?.dateTime || item?.start?.date || ""),
      end: item?.end?.dateTime || item?.end?.date || undefined,
      location: item?.location || undefined,
      htmlLink: item?.htmlLink || undefined,
    }));

    return { ok: true, events, readOnly: true };
  } catch (error: any) {
    return {
      ok: false,
      events: [],
      error: error?.message || String(error),
      readOnly: true,
    };
  }
}
