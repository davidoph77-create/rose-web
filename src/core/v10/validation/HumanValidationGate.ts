import {
  ValidationGateResult,
  ValidationRequest,
} from "./ValidationTypes";

type OrchestratorLike = {
  sequence?: Array<{
    id?: string;
    agent?: string;
    title?: string;
    status?: string;
    requiresValidation?: boolean;
    external?: boolean;
  }>;
};

export function buildValidationGate(
  orchestrator: OrchestratorLike
): ValidationGateResult {
  const sequence =
    Array.isArray(orchestrator.sequence)
      ? orchestrator.sequence
      : [];

  const pending: ValidationRequest[] =
    sequence
      .filter(
        (step) =>
          step.external === true &&
          (
            step.requiresValidation === true ||
            step.status === "blocked"
          )
      )
      .map((step, index) => ({
        id:
          step.id
            ? `validation_${step.id}`
            : `validation_${Date.now()}_${index}`,
        createdAt:
          new Date().toISOString(),
        agent:
          step.agent || "external-agent",
        action:
          step.title || "Action externe",
        reason:
          "Rose V10 exige une validation humaine avant toute action externe.",
        external: true,
        status: "pending",
      }));

  return {
    pending,
    approved: [],
    rejected: [],
    blockedCount: pending.length,
    summary:
      pending.length > 0
        ? `${pending.length} validation(s) humaine(s) requise(s). Aucune action externe n'a été exécutée.`
        : "Aucune validation humaine n'est requise pour ce traitement.",
  };
}
