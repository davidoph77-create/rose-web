import { CalendarConnectorResult } from "./CalendarConnectorTypes";

const entries: CalendarConnectorResult[] = [];

export const CalendarConnectorAuditStore = {
  add(entry: CalendarConnectorResult) {
    entries.unshift(entry);
    if (entries.length > 100) entries.length = 100;
  },

  list(): CalendarConnectorResult[] {
    return [...entries];
  },

  clear() {
    entries.length = 0;
  },
};
