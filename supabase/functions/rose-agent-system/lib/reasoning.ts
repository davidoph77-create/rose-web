import { Intent, Mood } from "./types.ts";

export type ReasoningResult = {
  strategy: string;
  steps: string[];
  confidence: number;
};

export function buildReasoning(params: {
  intent: Intent;
  mood: Mood;
  message: string;
  memory_context: string;
}): ReasoningResult {

  const steps: string[] = [];

  steps.push("Analyser la demande utilisateur");

  if (params.memory_context && !params.memory_context.includes("Aucune mémoire")) {
    steps.push("Utiliser les souvenirs pertinents");
  }

  if (params.intent === "project") {
    steps.push("Structurer une réponse orientée architecture");
  }

  if (params.intent === "task") {
    steps.push("Identifier les actions concrètes");
  }

  if (params.intent === "search") {
    steps.push("Préparer une recherche web structurée");
  }

  if (params.intent === "memory") {
    steps.push("Confirmer et exploiter la mémoire utilisateur");
  }

  steps.push("Produire une réponse claire et utile");

  return {
    strategy: `Répondre avec intelligence contextuelle en fonction de l'intention ${params.intent}`,
    steps,
    confidence: 0.85
  };
}