import { CalendarProvider } from "./CalendarProvider";
import { DisabledCalendarProvider } from "./DisabledCalendarProvider";

let provider: CalendarProvider = new DisabledCalendarProvider();

export const CalendarProviderRegistry = {
  get(): CalendarProvider {
    return provider;
  },

  register(next: CalendarProvider) {
    provider = next;
  },

  reset() {
    provider = new DisabledCalendarProvider();
  },
};
