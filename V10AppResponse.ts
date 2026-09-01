export type RoseV10AppSummary = {
  text: string;
  intent?: string;
  confidence?: number;
  selectedAgents: string[];
  requiresValidation: boolean;
};

export function formatRoseV10AppResponse(
  value: unknown
): RoseV10AppSummary {
  const response = asRecord(value);
  const routed = asRecord(response.result);
  const decision = asRecord(routed.decision);

  const intent =
    typeof decision.intent === "string"
      ? decision.intent
      : undefined;

  const confidence =
    typeof decision.confidence === "number"
      ? decision.confidence
      : undefined;

  const selectedAgents = Array.isArray(
    routed.selectedAgents
  )
    ? routed.selectedAgents.filter(
        (item): item is string =>
          typeof item === "string"
      )
    : [];

  const requiresValidation =
    decision.requiresValidation === true;

  const intentLabel =
    intentLabelFr(intent);

  const agentsText =
    selectedAgents.length > 0
      ? selectedAgents.join(", ")
      : "aucun agent spécialisé";

  const validationText =
    requiresValidation
      ? " Une validation reste nécessaire avant toute action externe."
      : "";

  return {
    text:
      `Rose V10 a analysé ta demande. ` +
      `Intention détectée : ${intentLabel}. ` +
      `Routage : ${agentsText}.` +
      validationText,
    intent,
    confidence,
    selectedAgents,
    requiresValidation,
  };
}

function intentLabelFr(
  intent?: string
): string {
  switch (intent) {
    case "memory":
      return "mémoire";
    case "planning":
      return "planification";
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
      return "non déterminée";
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
