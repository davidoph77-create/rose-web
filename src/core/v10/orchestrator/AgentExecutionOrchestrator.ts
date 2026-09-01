import {
  OrchestratorResult,
  OrchestratorStep,
} from "./OrchestratorTypes";

type ExecutionLike = {
  intent?: string;
  selectedAgents?: string[];
  requiresValidation?: boolean;
  steps?: Array<{
    id?: string;
    agent?: string;
    title?: string;
    status?: string;
    requiresValidation?: boolean;
    external?: boolean;
    output?: string;
  }>;
};

export function orchestrateExecution(
  execution: ExecutionLike
): OrchestratorResult {
  const intent =
    execution.intent || "general";

  const selectedAgents =
    Array.isArray(execution.selectedAgents)
      ? execution.selectedAgents
      : [];

  const rawSteps =
    Array.isArray(execution.steps)
      ? execution.steps
      : [];

  const sequence: OrchestratorStep[] =
    rawSteps.map((step, index) => {
      const external =
        step.external === true;

      const requiresValidation =
        step.requiresValidation === true ||
        (external &&
          execution.requiresValidation === true);

      const status =
        external && requiresValidation
          ? "blocked"
          : "ready";

      return {
        id:
          step.id ||
          `orch_${Date.now()}_${index}`,
        order: index + 1,
        agent:
          step.agent ||
          selectedAgents[index] ||
          "cognitive-agent",
        title:
          step.title ||
          `Étape ${index + 1}`,
        dependsOn:
          index === 0
            ? []
            : [
                rawSteps[index - 1]?.id ||
                `orch_${index - 1}`,
              ],
        status,
        requiresValidation,
        external,
        output:
          step.output ||
          "Traitement préparé.",
      };
    });

  if (sequence.length === 0) {
    sequence.push({
      id: `orch_${Date.now()}_0`,
      order: 1,
      agent:
        selectedAgents[0] ||
        "cognitive-agent",
      title: "Traiter la demande",
      dependsOn: [],
      status: "ready",
      requiresValidation: false,
      external: false,
      output:
        "Rose V10 a préparé un traitement interne.",
    });
  }

  const blockedExternalActions =
    sequence.filter(
      (step) =>
        step.external &&
        step.status === "blocked"
    ).length;

  const readyInternalActions =
    sequence.filter(
      (step) =>
        !step.external &&
        step.status === "ready"
    ).length;

  const requiresValidation =
    blockedExternalActions > 0 ||
    execution.requiresValidation === true;

  const summary =
    blockedExternalActions > 0
      ? `${sequence.length} étape(s) orchestrée(s), ${blockedExternalActions} action(s) externe(s) bloquée(s) en attente de validation.`
      : `${sequence.length} étape(s) orchestrée(s), ${readyInternalActions} action(s) interne(s) prête(s).`;

  return {
    intent,
    selectedAgents:
      selectedAgents.length > 0
        ? selectedAgents
        : sequence.map((step) => step.agent),
    sequence,
    blockedExternalActions,
    readyInternalActions,
    requiresValidation,
    summary,
  };
}
