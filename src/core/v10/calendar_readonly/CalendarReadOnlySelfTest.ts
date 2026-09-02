import { GoogleCalendarReadOnlyProvider } from "./GoogleCalendarReadOnlyProvider";

export function calendarReadOnlySelfTest() {
  const provider = new GoogleCalendarReadOnlyProvider();

  return {
    providerId: provider.id,
    status: provider.getStatus(),
    capabilities: provider.getCapabilities(),
    expectedStatusWithoutOAuth: "not-configured",
    writeCapabilityPresent: provider.getCapabilities().includes("create"),
    ok:
      provider.id === "google-calendar-readonly" &&
      provider.getStatus() === "not-configured" &&
      !provider.getCapabilities().includes("create"),
  };
}
