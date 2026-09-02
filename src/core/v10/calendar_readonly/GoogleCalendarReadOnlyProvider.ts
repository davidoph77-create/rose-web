import { CalendarProvider } from "../calendar_provider/CalendarProvider";
import {
  CalendarProviderCapability,
  CalendarProviderContext,
  CalendarProviderResult,
} from "../calendar_provider/CalendarProviderTypes";

export type GoogleCalendarReadOnlyConfig = {
  accessToken?: string;
  calendarId?: string;
};

export class GoogleCalendarReadOnlyProvider implements CalendarProvider {
  readonly id = "google-calendar-readonly";
  private config: GoogleCalendarReadOnlyConfig;

  constructor(config: GoogleCalendarReadOnlyConfig = {}) {
    this.config = {
      calendarId: "primary",
      ...config,
    };
  }

  getStatus() {
    return this.config.accessToken ? ("ready" as const) : ("not-configured" as const);
  }

  getCapabilities(): CalendarProviderCapability[] {
    return ["read"];
  }

  async listUpcoming(
    context: CalendarProviderContext
  ): Promise<CalendarProviderResult> {
    if (!context.humanApproved || !context.releaseGateConfirmed || !context.evidenceIntegrityOk) {
      return {
        ok: false,
        provider: this.id,
        executedExternally: false,
        message: "Google Calendar read blocked by V10 safety gate.",
        timestamp: new Date().toISOString(),
      };
    }

    if (!this.config.accessToken) {
      return {
        ok: false,
        provider: this.id,
        executedExternally: false,
        message: "Google Calendar OAuth token missing. Read-only connection not authenticated yet.",
        timestamp: new Date().toISOString(),
      };
    }

    const now = new Date().toISOString();
    const calendarId = encodeURIComponent(this.config.calendarId || "primary");
    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events` +
      `?timeMin=${encodeURIComponent(now)}` +
      `&singleEvents=true&orderBy=startTime&maxResults=10`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          provider: this.id,
          executedExternally: true,
          message: `Google Calendar read failed (${response.status}).`,
          data,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        ok: true,
        provider: this.id,
        executedExternally: true,
        message: "Google Calendar read-only request completed.",
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        ok: false,
        provider: this.id,
        executedExternally: true,
        message: error instanceof Error ? error.message : "Google Calendar read failed.",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
