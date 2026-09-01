import {
  RoseExecutionResult,
} from "./ExecutionTypes";
import {
  buildSafeAgentSteps,
} from "./SafeAgentExecutor";

export function buildCognitiveExecution(
  value: unknown
): RoseExecutionResult {
  const response = asRecord(value);
  const routed = asRecord(response.result);
  const decision = asRecord(routed.decision);

  const intent =
    typeof decision.intent === "string"
      ? decision.intent
      : "general";

  const selectedAgents =
    Array.isArray(routed.selectedAgents)
      ? routed.selectedAgents.filter(
          (item): item is string =>
            typeof item === "string"
        )
      : [];

  const requiresValidation =
    decision.requiresValidation === true;

  const steps = buildSafeAgentSteps(
    intent,
    selectedAgents,
    requiresValidation
  );

  const blockedCount =
    steps.filter(
      (step) => step.status === "blocked"
    ).length;

  const externalActionsBlocked =
    steps.some(
      (step) =>
        step.external &&
        step.status === "blocked"
    );

  const summary =
    blockedCount > 0
      ? `${steps.length} traitement(s) préparé(s), ${blockedCount} action(s) externe(s) en attente de validation.`
      : `${steps.length} traitement(s) interne(s) préparé(s) sans exécution externe automatique.`;

  return {
    intent,
    selectedAgents:
      selectedAgents.length > 0
        ? selectedAgents
        : steps.map((step) => step.agent),
    requiresValidation,
    externalActionsBlocked,
    steps,
    summary,
  };
}

function asRecord(
  value: unknown
): Record<string, any> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, any>;
  }

  return {};
}
