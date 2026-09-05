import { prepareIntegratedCalendarWriteDraft } from "./CalendarWriteDraftIntegration";

export function runCalendarWriteDraftSelfTest() {
  const complete = prepareIntegratedCalendarWriteDraft(
    "Ajoute un rendez-vous chez le notaire mardi à 14 h"
  );

  const incomplete = prepareIntegratedCalendarWriteDraft(
    "Ajoute un rendez-vous chez le notaire"
  );

  return {
    module: "V10-042C",
    integrationReady: true,
    complete: {
      handled: complete.handled,
      readyForApproval: complete.readyForApproval,
      writeEnabled: complete.writeEnabled,
    },
    incomplete: {
      handled: incomplete.handled,
      readyForApproval: incomplete.readyForApproval,
      writeEnabled: incomplete.writeEnabled,
      missing: incomplete.draft?.missing,
    },
  };
}
