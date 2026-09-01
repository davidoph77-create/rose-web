import {
  OrchestratorResult,
} from "./OrchestratorTypes";

export function formatMultiAgentChain(
  result: OrchestratorResult
): string {
  return result.sequence
    .map((step) => {
      const dependency =
        step.dependsOn.length > 0
          ? ` après ${step.dependsOn.join(", ")}`
          : "";

      const validation =
        step.requiresValidation
          ? " [validation requise]"
          : "";

      return (
        `${step.order}. ${step.agent} → ` +
        `${step.title}${dependency}${validation}`
      );
    })
    .join(" | ");
}
