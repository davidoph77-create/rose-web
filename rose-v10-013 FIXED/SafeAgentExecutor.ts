import {
  RoseExecutionIntent,
  RoseExecutionStep,
} from "./ExecutionTypes";

export function buildSafeAgentSteps(
  intent: RoseExecutionIntent,
  selectedAgents: string[],
  requiresValidation: boolean
): RoseExecutionStep[] {
  const agents =
    selectedAgents.length > 0
      ? selectedAgents
      : inferAgents(intent);

  return agents.map((agent, index) => {
    const external =
      isExternalAgent(agent) ||
      intent === "calendar" ||
      intent === "web";

    const blocked =
      external && requiresValidation;

    return {
      id: `exec_${Date.now()}_${index}`,
      agent,
      title: titleForAgent(agent, intent),
      status: blocked ? "blocked" : "prepared",
      requiresValidation:
        blocked || requiresValidation,
      external,
      output: outputForAgent(
        agent,
        intent,
        blocked
      ),
    };
  });
}

function inferAgents(
  intent: RoseExecutionIntent
): string[] {
  switch (intent) {
    case "memory":
      return ["memory-agent"];
    case "planning":
      return ["planner-agent"];
    case "goal":
      return ["goal-agent", "planner-agent"];
    case "calendar":
      return ["calendar-agent"];
    case "business":
      return ["business-agent"];
    case "web":
      return ["web-agent"];
    case "voice":
      return ["voice-agent"];
    default:
      return ["cognitive-agent"];
  }
}

function isExternalAgent(
  agent: string
): boolean {
  const value = agent.toLowerCase();
  return (
    value.includes("calendar") ||
    value.includes("web")
  );
}

function titleForAgent(
  agent: string,
  intent: RoseExecutionIntent
): string {
  const value = agent.toLowerCase();

  if (value.includes("memory"))
    return "Préparer la mémorisation";
  if (value.includes("planner"))
    return "Construire un plan";
  if (value.includes("goal"))
    return "Structurer l’objectif";
  if (value.includes("calendar"))
    return "Préparer l’événement agenda";
  if (value.includes("business"))
    return "Analyser le contexte entreprise";
  if (value.includes("web"))
    return "Préparer la recherche Web";
  if (value.includes("voice"))
    return "Préparer la réponse vocale";

  return `Traiter l’intention ${intent}`;
}

function outputForAgent(
  agent: string,
  intent: RoseExecutionIntent,
  blocked: boolean
): string {
  if (blocked) {
    return (
      `${agent} a préparé l’action, ` +
      `mais son exécution réelle est bloquée ` +
      `jusqu’à validation de David.`
    );
  }

  switch (intent) {
    case "planning":
      return (
        `${agent} peut organiser la demande ` +
        `en étapes ordonnées, mesurables et prioritaires.`
      );
    case "goal":
      return (
        `${agent} peut transformer la demande ` +
        `en objectif, sous-objectifs et progression.`
      );
    case "memory":
      return (
        `${agent} peut classer et relier ` +
        `l’information à la mémoire Rose.`
      );
    case "business":
      return (
        `${agent} peut analyser les données utiles ` +
        `et préparer une prochaine action entreprise.`
      );
    case "voice":
      return (
        `${agent} peut préparer le contenu ` +
        `pour la restitution vocale.`
      );
    default:
      return `${agent} a préparé son traitement interne.`;
  }
}
