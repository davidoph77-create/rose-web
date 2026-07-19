import { Intent } from "./types.ts";
import { runExecutionEngineV3 } from "./execution_engine_v3.ts";
import { buildAutonomousPlan } from "./planner.ts";
import { runWebAgent } from "./web_agent.ts";
import { truncate } from "./utils.ts";

export type AutonomyLoopStep = {
  iteration: number;
  focus: string;
  status: "done" | "stopped" | "skipped";
  output: string;
};

export type AutonomyLoopResult = {
  objective: string;
  strategy: string;
  iterations: number;
  stop_reason: string;
  steps: AutonomyLoopStep[];
  final_summary: string;
};

const MAX_AUTONOMY_ITERATIONS = 3;

export async function runAutonomyLoop(params: {
  intent: Intent;
  message: string;
}): Promise<AutonomyLoopResult> {
  const message = truncate(params.message, 500);
  const objective = buildObjective(params.intent, message);
  const strategy = buildStrategy(params.intent);

  const steps: AutonomyLoopStep[] = [];

  for (let iteration = 1; iteration <= MAX_AUTONOMY_ITERATIONS; iteration++) {
    const focus = getIterationFocus(iteration, params.intent);

    const plan = buildAutonomousPlan({
      intent: params.intent,
      message,
    });

    const exec = await runExecutionEngineV3({
      intent: params.intent,
      message,
    });

    const web = await runWebAgent(message);

    const usefulActions = exec.actions.filter((a) =>
      a.status === "done" || a.status === "planned"
    );

    const output = buildIterationOutput({
      objective: plan.goal,
      strategy: plan.strategy,
      step_count: plan.steps.length,
      useful_action_count: usefulActions.length,
      top_actions: usefulActions.slice(0, 3).map((a) => a.type),
      web_query: web.query,
      web_should_search: web.should_search,
    });

    steps.push({
      iteration,
      focus,
      status: "done",
      output,
    });

    if (shouldStopLoop(params.intent, usefulActions.map((a) => a.type), web.should_search, iteration)) {
      return {
        objective,
        strategy,
        iterations: iteration,
        stop_reason: buildStopReason(params.intent, usefulActions.map((a) => a.type), web.should_search, iteration),
        steps,
        final_summary: buildFinalSummary(objective, strategy, steps),
      };
    }
  }

  return {
    objective,
    strategy,
    iterations: steps.length,
    stop_reason: "Limite maximale d'itérations atteinte.",
    steps,
    final_summary: buildFinalSummary(objective, strategy, steps),
  };
}

function buildObjective(intent: Intent, message: string): string {
  switch (intent) {
    case "project":
      return "Faire avancer le projet utilisateur avec une stratégie exploitable et progressive.";
    case "self_improvement":
      return "Améliorer Rose de manière cohérente, modulaire et durable.";
    case "search":
      return "Préparer une recherche web utile et exploitable.";
    case "task":
      return "Transformer la demande en actions concrètes et priorisées.";
    case "calendar":
      return "Préparer un besoin agenda ou rappel structuré.";
    case "goal_tracking":
      return "Faire progresser l'utilisateur vers son objectif avec une suite claire.";
    case "memory":
      return "Exploiter et consolider la mémoire utile pour répondre avec continuité.";
    default:
      return `Répondre intelligemment à la demande : ${message}`;
  }
}

function buildStrategy(intent: Intent): string {
  switch (intent) {
    case "project":
      return "Analyser → Structurer → Prioriser → Définir la meilleure prochaine action.";
    case "self_improvement":
      return "Diagnostiquer → Renforcer → Organiser → Optimiser.";
    case "search":
      return "Détecter le besoin web → Formuler la requête → Préparer l'exploitation.";
    case "task":
      return "Clarifier → Extraire → Prioriser → Exécuter mentalement la suite.";
    case "calendar":
      return "Identifier le besoin → Structurer l'événement → Préparer l'action.";
    case "goal_tracking":
      return "Mesurer l'avancement → Déterminer le prochain jalon → Prioriser.";
    case "memory":
      return "Relire → Sélectionner → Réinjecter le souvenir utile.";
    default:
      return "Comprendre → Organiser → Répondre clairement.";
  }
}

function getIterationFocus(iteration: number, intent: Intent): string {
  if (intent === "project") {
    if (iteration === 1) return "Analyse du besoin";
    if (iteration === 2) return "Structuration du plan";
    return "Optimisation de la suite";
  }

  if (intent === "self_improvement") {
    if (iteration === 1) return "Diagnostic de Rose";
    if (iteration === 2) return "Plan d'amélioration";
    return "Ordre d'implémentation";
  }

  if (intent === "search") {
    if (iteration === 1) return "Préparation de la recherche";
    return "Validation de l'arrêt";
  }

  if (intent === "task") {
    if (iteration === 1) return "Extraction de tâche";
    return "Priorisation";
  }

  return iteration === 1 ? "Compréhension" : "Affinage";
}

function buildIterationOutput(params: {
  objective: string;
  strategy: string;
  step_count: number;
  useful_action_count: number;
  top_actions: string[];
  web_query: string;
  web_should_search: boolean;
}): string {
  return [
    `Objectif: ${params.objective}`,
    `Stratégie: ${params.strategy}`,
    `Étapes planifiées: ${params.step_count}`,
    `Actions utiles: ${params.useful_action_count}`,
    `Top actions: ${params.top_actions.join(", ") || "aucune"}`,
    `Recherche web: ${params.web_should_search ? "oui" : "non"}`,
    `Requête web: ${params.web_query || "aucune"}`,
  ].join(" | ");
}

function shouldStopLoop(
  intent: Intent,
  actionTypes: string[],
  shouldSearchWeb: boolean,
  iteration: number,
): boolean {
  if (intent === "project") {
    return actionTypes.includes("build_architecture_plan") &&
      actionTypes.includes("propose_next_step");
  }

  if (intent === "self_improvement") {
    return actionTypes.includes("propose_growth_plan");
  }

  if (intent === "search") {
    return shouldSearchWeb || iteration >= 2;
  }

  if (intent === "task") {
    return actionTypes.includes("extract_task") || iteration >= 2;
  }

  if (intent === "calendar") {
    return actionTypes.includes("prepare_calendar_event") || iteration >= 2;
  }

  if (intent === "goal_tracking") {
    return actionTypes.includes("track_goal_progress") || iteration >= 2;
  }

  return iteration >= 2;
}

function buildStopReason(
  intent: Intent,
  actionTypes: string[],
  shouldSearchWeb: boolean,
  iteration: number,
): string {
  if (intent === "project" &&
    actionTypes.includes("build_architecture_plan") &&
    actionTypes.includes("propose_next_step")) {
    return "Plan projet suffisamment structuré avec prochaine action définie.";
  }

  if (intent === "self_improvement" &&
    actionTypes.includes("propose_growth_plan")) {
    return "Plan d'amélioration suffisamment structuré.";
  }

  if (intent === "search" && shouldSearchWeb) {
    return "Recherche web utile détectée et préparée.";
  }

  if (intent === "task") {
    return "Tâche suffisamment cadrée.";
  }

  if (intent === "calendar") {
    return "Besoin agenda suffisamment cadré.";
  }

  return `Arrêt intelligent à l'itération ${iteration}.`;
}

function buildFinalSummary(
  objective: string,
  strategy: string,
  steps: AutonomyLoopStep[],
): string {
  return `
Objectif : ${objective}

Stratégie : ${strategy}

Résultat :
- boucle autonome exécutée
- plan structuré
- prochaine action clarifiée
- réponse prête pour l'utilisateur
- nombre d'itérations : ${steps.length}
`.trim();
}