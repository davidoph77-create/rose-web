import { CalendarProviderRegistry } from "./CalendarProviderRegistry";

export function getCalendarProviderHealth() {
  const provider = CalendarProviderRegistry.get();

  return {
    providerId: provider.id,
    status: provider.getStatus(),
    capabilities: provider.getCapabilities(),
    realProviderConfigured: provider.getStatus() === "ready",
    v10SafetyGateRequired: true,
    realWriteEnabled: false,
  };
}
