import { CalendarProviderRegistry } from "../calendar_provider/CalendarProviderRegistry";
import { GoogleCalendarReadOnlyProvider } from "./GoogleCalendarReadOnlyProvider";

let installed = false;

export function installGoogleCalendarReadOnlyProvider(accessToken?: string) {
  const provider = new GoogleCalendarReadOnlyProvider({
    accessToken,
    calendarId: "primary",
  });

  CalendarProviderRegistry.register(provider);
  installed = true;

  return {
    installed,
    providerId: provider.id,
    status: provider.getStatus(),
    capabilities: provider.getCapabilities(),
    writeEnabled: false,
  };
}

export function getCalendarReadOnlyRuntimeStatus() {
  const provider = CalendarProviderRegistry.get();

  return {
    installed,
    providerId: provider.id,
    providerStatus: provider.getStatus(),
    capabilities: provider.getCapabilities(),
    readOnly: true,
    writeEnabled: false,
  };
}
