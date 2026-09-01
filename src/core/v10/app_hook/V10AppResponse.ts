import {
  buildCognitiveExecution,
} from "../execution_pipeline";
import {
  orchestrateExecution,
  formatMultiAgentChain,
} from "../orchestrator";

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

  const intent =
    orchestrated.intent;

  const confidence =
    typeof decision.confidence === "number"
      ? decision.confidence
      : undefined;

  const selectedAgents =
    orchestrated.selectedAgents;

  const requiresValidation =
    orchestrated.requiresValidation;

  const agentChain =
    formatMultiAgentChain(orchestrated);

  const confidenceText =
    typeof confidence === "number"
      ? ` Confiance : ${Math.round(confidence * 100)} %.`
      : "";

  const validationText =
    requiresValidation
      ? " Les actions externes restent bloquées jusqu’à validation."
      : " Aucune action externe automatique n’a été exécutée.";

  const suggestedAction =
    buildSuggestedAction(intent);

  return {
    text:
      `Rose V10 a orchestré ses agents. ` +
      `Intention : ${intentLabelFr(intent)}. ` +
      `Agents : ${selectedAgents.join(", ") || "cognitive-agent"}.` +
      confidenceText +
      ` ${orchestrated.summary} ` +
      `Chaîne : ${agentChain}.` +
      validationText +
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
  };
}

function buildSuggestedAction(
  intent?: string
): string | undefined {
  switch (intent) {
    case "planning":
      return "je peux enchaîner mémoire, objectif et planification pour construire un plan plus complet.";
    case "goal":
      return "je peux relier l’objectif à un plan d’actions et à son suivi.";
    case "calendar":
      return "je peux préparer la chaîne planification → agenda, puis attendre ta validation.";
    case "business":
      return "je peux combiner mémoire entreprise, analyse et planification.";
    case "web":
      return "je peux préparer la recherche, puis attendre ta validation avant toute action externe.";
    case "memory":
      return "je peux relier cette information aux souvenirs utiles puis proposer la prochaine étape.";
    default:
      return "je peux poursuivre avec plusieurs agents V10 coordonnés.";
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
