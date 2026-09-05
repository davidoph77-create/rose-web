import { prepareCalendarWriteDraft } from "./CalendarWriteFoundation";

export function runCalendarWriteFoundationSelfTest() {
  const result = prepareCalendarWriteDraft(
    "Ajoute un rendez-vous chez le notaire mardi à 14 h"
  );

  return {
    module: "V10-042A",
    foundationReady: true,
    handled: result.handled,
    requiresApproval: true,
    writeEnabled: false,
    draftStatus: result.draft?.status,
  };
}
