import { CalendarProvider } from "./CalendarProvider";
import {
  CalendarEventDraft,
  CalendarProviderContext,
  CalendarProviderResult,
} from "./CalendarProviderTypes";

export class DisabledCalendarProvider implements CalendarProvider {
  readonly id = "calendar-provider-disabled";

  getStatus() {
    return "not-configured" as const;
  }

  getCapabilities() {
    return [] as const;
  }

  async listUpcoming(
    _context: CalendarProviderContext
  ): Promise<CalendarProviderResult> {
    return {
      ok: false,
      provider: this.id,
      executedExternally: false,
      message:
        "No real Calendar provider is configured yet. V10 safety pipeline remains active.",
      timestamp: new Date().toISOString(),
    };
  }

  async createEvent(
    _event: CalendarEventDraft,
    _context: CalendarProviderContext
  ): Promise<CalendarProviderResult> {
    return {
      ok: false,
      provider: this.id,
      executedExternally: false,
      message:
        "Real Calendar write blocked: provider is not configured.",
      timestamp: new Date().toISOString(),
    };
  }
}
