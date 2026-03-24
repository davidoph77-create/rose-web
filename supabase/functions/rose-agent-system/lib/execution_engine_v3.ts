import { Intent } from "./types.ts";
import { runWebAgent } from "./web_agent.ts";
import { truncate } from "./utils.ts";

export type ExecutionActionV3 = {
  type: string;
  status: "planned" | "done" | "skipped" | "deferred";
  reason: string;
  priority: number;
  payload?: Record<string, unknown>;
};

export type ExecutionEngineV3Result = {
  objective: string;
  strategy: string;
  iterations: number;
  stop_reason: string;
  actions: ExecutionActionV3[];
  final_summary: string;
};

type EngineContext = {
  intent: Intent;
  message: string;
};

const MAX_ITERATIONS = 3;

export async function runExecutionEngineV3(
  params: EngineContext,
): Promise<ExecutionEngineV3Result> {
  const message = truncate(params.message, 400);

  const actions: ExecutionActionV3[] = [];
  let iterations = 0;
  let stop_reason = "Boucle terminée normalement.";

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const loopActions = await buildLoopActions({
      intent: params.intent,
      message,
      iteration: iterations,
    });

    actions.push(...loopActions);

    const doneActions = loopActions.filter((a) => a.status === "done");
    const plannedActions = loopActions.filter((a) => a.status === "planned");

    if (doneActions.length === 0 && plannedActions.length === 0) {
      stop_reason = "Aucune action utile supplémentaire détectée.";
      break;
    }

    if (hasTerminalProgress(loopActions)) {
      stop_reason = "Objectif suffisamment structuré pour produire une réponse finale.";
      break;
    }

    if (iterations >= MAX_ITERATIONS) {
      stop_reason = "Limite d'itérations atteinte.";
      break;
    }
  }

  const sorted = [...actions].sort((a, b) => b.priority - a.priority);

  return {
    objective: buildObjective(params.intent),
    strategy: buildStrategy(params.intent),
    iterations,
    stop_reason,
    actions: sorted,
    final_summary: buildSummary(sorted, iterations, stop_reason),
  };
}

async function buildLoopActions(params: {
  intent: Intent;
  message: string;
  iteration: number;
}): Promise<ExecutionActionV3[]> {
  const result: ExecutionActionV3[] = [];

  if (params.iteration === 1) {
    result.push({
      type: "analyze_request",
      status: "done",
      reason: `Analyse initiale de la demande pour l'intention ${params.intent}.`,
      priority: 100,
      payload: { message: params.message },
    });
  }

  switch (params.intent) {
    case "project": {
      if (params.iteration === 1) {
        result.push({
          type: "build_architecture_plan",
          status: "done",
          reason: "Une architecture ou roadmap doit être proposée.",
          priority: 95,
          payload: {
            focus: ["architecture", "mémoire", "agents", "robustesse"],
          },
        });

        result.push({
          type: "propose_next_step",
          status: "done",
          reason: "Définir la prochaine action la plus utile.",
          priority: 90,
          payload: {
            recommendation: "Commencer par le module ayant le plus d'impact.",
          },
        });
      } else if (params.iteration === 2) {
        result.push({
          type: "refine_execution_sequence",
          status: "done",
          reason: "Affiner l'ordre d'implémentation pour rendre le plan exploitable.",
          priority: 88,
        });
      } else {
        result.push({
          type: "stop_loop",
          status: "skipped",
          reason: "Le plan projet est déjà suffisamment structuré.",
          priority: 10,
        });
      }
      break;
    }

    case "self_improvement": {
      if (params.iteration === 1) {
        result.push({
          type: "analyze_self_improvement",
          status: "done",
          reason: "Identifier ce qui doit être amélioré dans Rose.",
          priority: 95,
        });

        result.push({
          type: "propose_growth_plan",
          status: "done",
          reason: "Proposer une évolution réaliste et utile.",
          priority: 90,
        });
      } else {
        result.push({
          type: "stop_loop",
          status: "skipped",
          reason: "Le plan d'amélioration est déjà défini.",
          priority: 10,
        });
      }
      break;
    }

    case "search": {
      const web = await runWebAgent(params.message);

      result.push({
        type: "prepare_web_search",
        status: web.should_search ? "done" : "skipped",
        reason: web.should_search
          ? "Une recherche web pertinente a été préparée."
          : "Aucune recherche web utile détectée.",
        priority: 92,
        payload: {
          query: web.query,
          should_search: web.should_search,
        },
      });

      if (params.iteration >= 2) {
        result.push({
          type: "stop_loop",
          status: "skipped",
          reason: "La préparation de la recherche est suffisante pour répondre.",
          priority: 10,
        });
      }
      break;
    }

    case "task": {
      result.push({
        type: "extract_task",
        status: "done",
        reason: "Transformer la demande en tâche claire.",
        priority: 92,
        payload: { source: params.message },
      });

      if (params.iteration === 2) {
        result.push({
          type: "prioritize_task",
          status: "done",
          reason: "Déterminer l'ordre ou le niveau de priorité.",
          priority: 85,
        });
      }
      break;
    }

    case "calendar": {
      result.push({
        type: "prepare_calendar_event",
        status: "done",
        reason: "Préparer les informations utiles pour un événement agenda.",
        priority: 92,
        payload: { source: params.message },
      });

      if (params.iteration >= 2) {
        result.push({
          type: "stop_loop",
          status: "skipped",
          reason: "Le cadrage agenda est suffisant.",
          priority: 10,
        });
      }
      break;
    }

    case "memory": {
      result.push({
        type: "save_memory",
        status: "planned",
        reason: "Une information importante doit être conservée.",
        priority: 94,
      });

      result.push({
        type: "recall_memory",
        status: "planned",
        reason: "La mémoire existante peut être relue pour contextualiser la réponse.",
        priority: 86,
      });
      break;
    }

    case "goal_tracking": {
      result.push({
        type: "track_goal_progress",
        status: "done",
        reason: "Suivre l'avancement d'un objectif.",
        priority: 90,
      });

      result.push({
        type: "suggest_next_goal_step",
        status: "done",
        reason: "Proposer l'étape suivante la plus utile.",
        priority: 84,
      });
      break;
    }

    case "emergency": {
      result.push({
        type: "trigger_safety_protocol",
        status: "done",
        reason: "Une réponse orientée sécurité est prioritaire.",
        priority: 100,
      });
      break;
    }

    case "chat":
    default: {
      if (params.iteration === 1) {
        result.push({
          type: "analyze_request",
          status: "done",
          reason: "Comprendre la demande générale.",
          priority: 80,
        });
      } else {
        result.push({
          type: "stop_loop",
          status: "skipped",
          reason: "Pas d'action autonome supplémentaire nécessaire.",
          priority: 10,
        });
      }
      break;
    }
  }

  return dedupeActions(result);
}

function dedupeActions(actions: ExecutionActionV3[]): ExecutionActionV3[] {
  const map = new Map<string, ExecutionActionV3>();

  for (const action of actions) {
    const existing = map.get(action.type);

    if (!existing || action.priority > existing.priority) {
      map.set(action.type, action);
    }
  }

  return [...map.values()];
}

function hasTerminalProgress(actions: ExecutionActionV3[]): boolean {
  return actions.some((a) =>
    [
      "build_architecture_plan",
      "propose_growth_plan",
      "prepare_web_search",
      "prepare_calendar_event",
      "extract_task",
      "trigger_safety_protocol",
      "refine_execution_sequence",
    ].includes(a.type) && a.status === "done"
  );
}

function buildObjective(intent: Intent): string {
  switch (intent) {
    case "project":
      return "Faire avancer le projet utilisateur avec une stratégie exploitable.";
    case "self_improvement":
      return "Faire évoluer Rose de manière cohérente et progressive.";
    case "search":
      return "Préparer une recherche web utile et exploitable.";
    case "task":
      return "Transformer la demande en tâche claire et priorisée.";
    case "calendar":
      return "Préparer un événement ou une organisation temporelle.";
    case "memory":
      return "Conserver et exploiter une information importante.";
    case "goal_tracking":
      return "Suivre l'avancement d'un objectif et proposer la suite.";
    case "emergency":
      return "Répondre avec priorité à la sécurité.";
    default:
      return "Répondre utilement et clairement à la demande.";
  }
}

function buildStrategy(intent: Intent): string {
  switch (intent) {
    case "project":
      return "Analyser, structurer, prioriser, proposer une architecture ou roadmap.";
    case "self_improvement":
      return "Identifier le point faible, proposer une amélioration, ordonner l'implémentation.";
    case "search":
      return "Formuler la recherche, cadrer le résultat attendu, proposer la suite.";
    case "task":
      return "Extraire, clarifier et prioriser la tâche.";
    case "calendar":
      return "Identifier le besoin agenda et préparer les éléments utiles.";
    case "memory":
      return "Valider la mémoire et exploiter le contexte existant.";
    case "goal_tracking":
      return "Mesurer l'avancement et orienter la prochaine étape.";
    case "emergency":
      return "Réduire le risque et prioriser une réponse de sécurité.";
    default:
      return "Comprendre la demande, organiser la réponse, proposer l'action suivante.";
  }
}

function buildSummary(
  actions: ExecutionActionV3[],
  iterations: number,
  stop_reason: string,
): string {
  const doneCount = actions.filter((a) => a.status === "done").length;
  const plannedCount = actions.filter((a) => a.status === "planned").length;

  return `Execution Engine v3 terminé après ${iterations} itération(s), avec ${doneCount} action(s) exécutée(s) et ${plannedCount} action(s) planifiée(s). Arrêt : ${stop_reason}`;
}