import { WebConnectorResult } from "./WebConnectorTypes";

const entries: WebConnectorResult[] = [];

export const WebConnectorAuditStore = {
  add(entry: WebConnectorResult) {
    entries.unshift(entry);
    if (entries.length > 100) entries.length = 100;
  },

  list(): WebConnectorResult[] {
    return [...entries];
  },

  clear() {
    entries.length = 0;
  },
};
