export type RoseV10AppSummary = {
  text: string;
  intent?: string;
  confidence?: number;
  selectedAgents: string[];
  requiresValidation: boolean;
  suggestedAction?: string;
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

  const intentLabel = intentLabelFr(intent);

  const agentsText =
    selectedAgents.length > 0
      ? selectedAgents.join(", ")
      : "aucun agent spécialisé";

  const confidenceText =
    typeof confidence === "number"
      ? ` Confiance : ${Math.round(confidence * 100)} %.`
      : "";

  const suggestedAction =
    buildSuggestedAction(
      intent,
      requiresValidation
    );

  const validationText =
    requiresValidation
      ? " Une validation reste nécessaire avant toute action externe."
      : " Aucune action externe automatique n'est lancée.";

  return {
    text:
      `Rose V10 a analysé ta demande. ` +
      `Intention détectée : ${intentLabel}. ` +
      `Routage : ${agentsText}.` +
      confidenceText +
      validationText +
      (suggestedAction
        ? ` Proposition : ${suggestedAction}`
        : ""),
    intent,
    confidence,
    selectedAgents,
    requiresValidation,
    suggestedAction,
  };
}

function buildSuggestedAction(
  intent?: string,
  requiresValidation = false
): string | undefined {
  switch (intent) {
    case "planning":
      return "je peux transformer ta demande en étapes ordonnées et mesurables.";
    case "calendar":
      return requiresValidation
        ? "je peux préparer l'événement et te le présenter avant toute création réelle."
        : "je peux préparer l'organisation de cet événement.";
    case "business":
      return "je peux structurer les informations utiles pour ton activité et proposer une prochaine action.";
    case "web":
      return requiresValidation
        ? "je peux préparer la recherche à valider avant toute action externe."
        : "je peux préparer les axes de recherche pertinents.";
    case "memory":
      return "je peux classer cette information et la relier à ta mémoire existante.";
    case "voice":
      return "je peux préparer la réponse à lire à voix haute.";
    case "general":
      return "je peux poursuivre l'analyse avec les modules V10 adaptés.";
    default:
      return "je peux poursuivre l'analyse sans déclencher d'action externe.";
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
