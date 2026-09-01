import {
  ValidationGateResult,
} from "./ValidationTypes";

export function formatValidationRequests(
  gate: ValidationGateResult
): string {
  if (gate.pending.length === 0) {
    return gate.summary;
  }

  const items = gate.pending
    .map(
      (request, index) =>
        `${index + 1}. ${request.agent} → ${request.action} [EN ATTENTE]`
    )
    .join(" | ");

  return `${gate.summary} ${items}`;
}
