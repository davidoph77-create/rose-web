import { prepareGoogleCalendarCreatePayload } from "./CalendarCreatePreparation";

export function runCalendarCreatePreparationSelfTest() {
  const result = prepareGoogleCalendarCreatePayload({
    title: "Rendez-vous chez le notaire",
    originalMessage: "Ajoute un rendez-vous chez le notaire mardi à 14 h",
  });

  return {
    module: "V10-042F",
    payloadReady: result.ok,
    executionEnabled: result.executionEnabled,
    requiresExplicitApproval: result.requiresExplicitApproval,
    payload: result.payload,
    errors: result.errors,
    warnings: result.warnings,
  };
}
