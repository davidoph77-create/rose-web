import { Intent } from "./types.ts";
import { runWebAgent } from "./web_agent.ts";
import { truncate } from "./utils.ts";

export type ExecutionAction = {
  type: string;
  status: "planned" | "done" | "skipped";
  reason: string;
  payload?: Record<string, unknown>;
};

export type ExecutionEngineV2Result = {
  objective: string;
  strategy: string;
  actions: ExecutionAction[];
  final_summary: string;
};

export async function runExecutionEngineV2(params: {
  intent: Intent;
  message: string;
}): Promise<ExecutionEngineV2Result> {
  const message = truncate(params.message, 400);
  const actions: ExecutionAction[] = [];

  actions.push({
    type: "analyze_request",
    status: "done",
    reason: `Analyse de la demande pour l'intention ${params.intent}.`,
    payload: { message },
  });

  if (params.intent === "search") {
    const web = await runWebAgent(message);

    actions.push({
      type: "prepare_web_search",
      status: web.should_search ? "done" : "skipped",
      reason: web.should_search
        ? "Une recherche web pertinente a été préparée."
        : "Pas de recherche web utile détectée.",
      payload: {
        query: web.query,
        should_search: web.should_search,
      },
    });
  } else {
    actions.push({
      type: "prepare_web_search",
      status: "skipped",
      reason: "La recherche web n'est pas prioritaire pour cette intention.",
    });
  }

  if (params.intent === "project" || params.intent === "self_improvement") {
    actions.push({
      type: "build_architecture_plan",
      status: "done",
      reason: "Préparer un plan structuré d'amélioration du système.",
      payload: {
        focus: ["architecture", "agents", "mémoire", "robustesse"],
      },
    });

    actions.push({
      type: "propose_next_step",
      status: "done",
      reason: "Définir la prochaine meilleure action concrète.",
      payload: {
        recommendation: "Commencer par le module le plus prioritaire.",
      },
    });
  } else {
    actions.push({
      type: "build_architecture_plan",
      status: "skipped",
      reason: "Pas de plan architecture prioritaire pour cette demande.",
    });
  }

  if (params.intent === "task") {
    actions.push({
      type: "extract_task",
      status: "done",
      reason: "Une tâche exploitable a été détectée.",
      payload: {
        source: message,
      },
    });
  } else {
    actions.push({
      type: "extract_task",
      status: "skipped",
      reason: "Pas de tâche explicite à exécuter.",
    });
  }

  if (params.intent === "calendar") {
    actions.push({
      type: "prepare_calendar_event",
      status: "done",
      reason: "Un événement agenda peut être préparé.",
      payload: {
        source: message,
      },
    });
  } else {
    actions.push({
      type: "prepare_calendar_event",
      status: "skipped",
      reason: "Pas d'événement agenda à traiter.",
    });
  }

  const doneCount = actions.filter((a) => a.status === "done").length;

  return {
    objective: buildObjective(params.intent),
    strategy: buildStrategy(params.intent),
    actions,
    final_summary: `Execution Engine v2 terminé avec ${doneCount} action(s) utile(s).`,
  };
}

function buildObjective(intent: Intent): string {
  switch (intent) {
    case "project":
      return "Faire avancer le projet utilisateur avec une réponse structurée.";
    case "self_improvement":
      return "Améliorer Rose de manière cohérente et progressive.";
    case "search":
      return "Préparer une recherche utile et exploitable.";
    case "task":
      return "Transformer la demande en action concrète.";
    case "calendar":
      return "Préparer un événement ou une organisation temporelle.";
    default:
      return "Répondre utilement et clairement à la demande.";
  }
}

function buildStrategy(intent: Intent): string {
  switch (intent) {
    case "project":
      return "Analyser, structurer, prioriser, proposer une architecture ou une roadmap.";
    case "self_improvement":
      return "Identifier le point faible, proposer une amélioration, donner l'ordre d'implémentation.";
    case "search":
      return "Formuler la recherche, cadrer le résultat attendu, proposer la suite.";
    case "task":
      return "Extraire la tâche, clarifier, prioriser.";
    case "calendar":
      return "Identifier le besoin agenda, préparer les éléments utiles.";
    default:
      return "Comprendre la demande, organiser la réponse, proposer l'action suivante.";
  }
}