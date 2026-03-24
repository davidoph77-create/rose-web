import { Intent } from "./types.ts";
import { runWebAgent } from "./web_agent.ts";

export type ExecutionStepResult = {
  step: string;
  status: "done" | "skipped";
  output: string;
};

export type ExecutionEngineResult = {
  summary: string;
  executed_steps: ExecutionStepResult[];
};

export async function runExecutionEngine(params: {
  intent: Intent;
  message: string;
}): Promise<ExecutionEngineResult> {
  const results: ExecutionStepResult[] = [];

  results.push({
    step: "Analyse initiale",
    status: "done",
    output: `Intention détectée : ${params.intent}`,
  });

  if (params.intent === "search") {
    const web = await runWebAgent(params.message);

    results.push({
      step: "Préparation recherche web",
      status: web.should_search ? "done" : "skipped",
      output: web.should_search
        ? `Requête préparée : ${web.query}`
        : "Aucune recherche web utile détectée.",
    });
  } else {
    results.push({
      step: "Préparation recherche web",
      status: "skipped",
      output: "Recherche web non prioritaire pour cette demande.",
    });
  }

  if (params.intent === "project" || params.intent === "self_improvement") {
    results.push({
      step: "Planification architecture",
      status: "done",
      output:
        "Préparer une amélioration structurée de l’architecture, des agents et de la mémoire.",
    });
  } else {
    results.push({
      step: "Planification architecture",
      status: "skipped",
      output: "Pas de plan architecture prioritaire.",
    });
  }

  if (params.intent === "task") {
    results.push({
      step: "Préparation tâche",
      status: "done",
      output: "Transformer la demande en action concrète priorisée.",
    });
  } else {
    results.push({
      step: "Préparation tâche",
      status: "skipped",
      output: "Pas de tâche explicite à exécuter.",
    });
  }

  if (params.intent === "calendar") {
    results.push({
      step: "Préparation agenda",
      status: "done",
      output: "Identifier un événement et ses paramètres utiles.",
    });
  } else {
    results.push({
      step: "Préparation agenda",
      status: "skipped",
      output: "Pas d’événement agenda à traiter.",
    });
  }

  const doneCount = results.filter((r) => r.status === "done").length;

  return {
    summary: `Execution Engine terminé avec ${doneCount} étape(s) exécutée(s).`,
    executed_steps: results,
  };
}