import { readUpcomingGoogleCalendarEvents } from "./GoogleCalendarRealRead";

export async function runCalendarRealReadSelfTest() {
  const result = await readUpcomingGoogleCalendarEvents(1);
  return {
    module: "V10-040D",
    readOnly: true,
    ok: result.ok,
    eventCount: result.events.length,
    error: result.error,
  };
}
