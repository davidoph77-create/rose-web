import {
  buildCognitiveExecution,
} from "../execution_pipeline";

export type RoseV10AppSummary = {
  text: string;
  intent?: string;
  confidence?: number;
  selectedAgents: string[];
  requiresValidation: boolean;
  suggestedAction?: string;
  executionSummary?: string;
};

export function formatRoseV10AppResponse(
  value: unknown
): RoseV10AppSummary {
  const response = asRecord(value);
  const routed = asRecord(response.result);
  const decision = asRecord(routed.decision);

  const execution =
    buildCognitiveExecution(value);

  const intent = execution.intent;

  const confidence =
    typeof decision.confidence === "number"
      ? decision.confidence
      : undefined;

  const selectedAgents =
    execution.selectedAgents;

  const requiresValidation =
    execution.requiresValidation;

  const intentLabel =
    intentLabelFr(intent);

  const agentsText =
    selectedAgents.length > 0
      ? selectedAgents.join(", ")
      : "aucun agent spécialisé";

  const confidenceText =
    typeof confidence === "number"
      ? ` Confiance : ${Math.round(confidence * 100)} %.`
      : "";

  const stepsText =
    execution.steps
      .map(
        (step, index) =>
          `${index + 1}. ${step.title} — ${step.output}`
      )
      .join(" ");

  const validationText =
    execution.externalActionsBlocked
      ? " Les actions externes restent bloquées jusqu’à validation."
      : " Aucune action externe automatique n’a été exécutée.";

  const suggestedAction =
    buildSuggestedAction(intent);

  return {
    text:
      `Rose V10 a exécuté son pipeline cognitif. ` +
      `Intention : ${intentLabel}. ` +
      `Agents : ${agentsText}.` +
      confidenceText +
      ` ${execution.summary} ` +
      stepsText +
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
  };
}

function buildSuggestedAction(
  intent?: string
): string | undefined {
  switch (intent) {
    case "planning":
      return "je peux maintenant transformer ce plan préparé en étapes concrètes.";
    case "goal":
      return "je peux préparer l’objectif et ses sous-objectifs.";
    case "calendar":
      return "je peux préparer les détails du rendez-vous avant validation.";
    case "business":
      return "je peux préparer une action entreprise prioritaire.";
    case "web":
      return "je peux préparer la recherche avant validation.";
    case "memory":
      return "je peux relier cette information aux souvenirs utiles.";
    default:
      return "je peux poursuivre avec le module V10 approprié.";
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
