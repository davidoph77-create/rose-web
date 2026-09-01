import {
  buildCognitiveExecution,
} from "../execution_pipeline";
import {
  orchestrateExecution,
  formatMultiAgentChain,
} from "../orchestrator";
import {
  buildValidationGate,
  formatValidationRequests,
} from "../validation";

export type RoseV10AppSummary = {
  text: string;
  intent?: string;
  confidence?: number;
  selectedAgents: string[];
  requiresValidation: boolean;
  suggestedAction?: string;
  executionSummary?: string;
  orchestratorSummary?: string;
  agentChain?: string;
  validationSummary?: string;
  pendingValidationCount?: number;
};

export function formatRoseV10AppResponse(
  value: unknown
): RoseV10AppSummary {
  const response = asRecord(value);
  const routed = asRecord(response.result);
  const decision = asRecord(routed.decision);

  const execution =
    buildCognitiveExecution(value);

  const orchestrated =
    orchestrateExecution(execution);

  const validationGate =
    buildValidationGate(orchestrated);

  const intent =
    orchestrated.intent;

  const confidence =
    typeof decision.confidence === "number"
      ? decision.confidence
      : undefined;

  const selectedAgents =
    orchestrated.selectedAgents;

  const requiresValidation =
    validationGate.blockedCount > 0;

  const agentChain =
    formatMultiAgentChain(orchestrated);

  const validationSummary =
    formatValidationRequests(validationGate);

  const confidenceText =
    typeof confidence === "number"
      ? ` Confiance : ${Math.round(confidence * 100)} %.`
      : "";

  const suggestedAction =
    buildSuggestedAction(
      intent,
      requiresValidation
    );

  return {
    text:
      `Rose V10 a exécuté son orchestration sécurisée. ` +
      `Intention : ${intentLabelFr(intent)}. ` +
      `Agents : ${selectedAgents.join(", ") || "cognitive-agent"}.` +
      confidenceText +
      ` ${orchestrated.summary} ` +
      `Chaîne : ${agentChain}. ` +
      `${validationSummary}` +
      (suggestedAction
        ? ` Proposition : ${suggestedAction}`
        : ""),
    intent,
    confidence,
    selectedAgents,
    requiresValidation,
    suggestedAction,
    executionSummary:
      execution.summary,
    orchestratorSummary:
      orchestrated.summary,
    agentChain,
    validationSummary,
    pendingValidationCount:
      validationGate.blockedCount,
  };
}

function buildSuggestedAction(
  intent?: string,
  requiresValidation = false
): string | undefined {
  if (requiresValidation) {
    return "je peux préparer l'action, mais j'attends ta validation avant toute exécution externe.";
  }

  switch (intent) {
    case "planning":
      return "je peux continuer à structurer les prochaines étapes.";
    case "goal":
      return "je peux relier l'objectif au plan d'action.";
    case "business":
      return "je peux poursuivre l'analyse interne de ton activité.";
    case "memory":
      return "je peux relier cette information aux souvenirs utiles.";
    default:
      return "je peux poursuivre avec les agents V10 adaptés.";
  }
}

function intentLabelFr(
  intent?: string
): string {
  switch (intent) {
    case "memory":
      return "mémoire";
    case "planning":
      return "planification";
    case "goal":
      return "objectif";
    case "calendar":
      return "agenda";
    case "business":
      return "entreprise";
    case "voice":
      return "voix";
    case "web":
      return "web";
    case "general":
      return "générale";
    default:
      return intent || "non déterminée";
  }
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
