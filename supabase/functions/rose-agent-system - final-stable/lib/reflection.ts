import { Intent, Mood } from "./types.ts";

export function buildReflectionNote(params: {
  intent: Intent;
  mood: Mood;
  memory_context: string;
  message: string;
}): string {
  const notes: string[] = [];

  notes.push(`Intent détectée : ${params.intent}`);
  notes.push(`Humeur détectée : ${params.mood}`);

  if (
    params.memory_context &&
    !params.memory_context.includes("Aucune mémoire significative")
  ) {
    notes.push("Une mémoire utile existe et doit influencer la réponse.");
  }

  if (params.intent === "project") {
    notes.push("Répondre avec structure, clarté et orientation produit/architecture.");
  }

  if (params.intent === "memory") {
    notes.push("Reconnaître la mémoire et répondre naturellement sans casser l'immersion.");
  }

  if (params.intent === "search") {
    notes.push("Préparer ou proposer une recherche web structurée.");
  }

  return notes.join(" ");
}