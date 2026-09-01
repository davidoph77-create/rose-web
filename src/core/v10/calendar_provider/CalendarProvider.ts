import {
  CalendarEventDraft,
  CalendarProviderCapability,
  CalendarProviderContext,
  CalendarProviderResult,
  CalendarProviderStatus,
} from "./CalendarProviderTypes";

export interface CalendarProvider {
  readonly id: string;
  getStatus(): CalendarProviderStatus;
  getCapabilities(): CalendarProviderCapability[];

  listUpcoming?(
    context: CalendarProviderContext
  ): Promise<CalendarProviderResult>;

  createEvent?(
    event: CalendarEventDraft,
    context: CalendarProviderContext
  ): Promise<CalendarProviderResult>;
}
