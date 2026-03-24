import {
  AgentName,
  Intent,
  Mood,
} from "./types.ts";
import { fetchRelevantMemories, fetchTargetedMemories } from "./memory.ts";
import { searchRelevantVectorMemories } from "./memory_vector.ts";
import { runWebAgent } from "./web_agent.ts";
import { runExecutionEngine } from "./execution_engine.ts";
import { runExecutionEngineV2 } from "./execution_engine_v2.ts";
import { runExecutionEngineV3 } from "./execution_engine_v3.ts";
import { buildAutonomousPlan } from "./planner.ts";
import { uniqueArray, truncate } from "./utils.ts";

export async function emotionAgent(
  mood: Mood,
  mood_score: number,
): Promise<string> {
  const intensity =
    mood_score >= 80 ? "très forte"
    : mood_score >= 60 ? "forte"
    : mood_score >= 40 ? "modérée"
    : "légère";

  switch (mood) {
    case "joy":
      return `L'utilisateur exprime une joie ${intensity}. Répondre avec enthousiasme, chaleur et valorisation.`;
    case "sadness":
      return `L'utilisateur exprime une tristesse ${intensity}. Répondre avec douceur, écoute et réassurance.`;
    case "anger":
      return `L'utilisateur exprime une colère ${intensity}. Répondre avec calme, structure et sans confrontation.`;
    case "fear":
      return `L'utilisateur exprime une peur ${intensity}. Répondre avec sécurité, prudence et clarté.`;
    case "stress":
      return `L'utilisateur exprime un stress ${intensity}. Répondre de manière rassurante, méthodique et apaisante.`;
    case "love":
      return `L'utilisateur exprime de l'affection ${intensity}. Répondre avec chaleur, tendresse respectueuse et proximité bienveillante.`;
    default:
      return "L'utilisateur n'exprime pas d'émotion dominante. Répondre naturellement avec chaleur.";
  }
}

export async function memoryAgent(
  user_id: string,
  query?: string,
): Promise<string> {
  if (query) {
    const vectorMemories = await searchRelevantVectorMemories(user_id, query, 5);

    if (vectorMemories.length > 0) {
      return `Mémoire utilisateur pertinente (vectorielle) :
${vectorMemories
  .map((m, i) => `${i + 1}. score=${m.score.toFixed(3)} ${m.content}`)
  .join("\n")}`;
    }
  }

  const memories = query
    ? await fetchTargetedMemories(user_id, query, 5)
    : await fetchRelevantMemories(user_id, 10);

  if (!memories.length) {
    return "Aucune mémoire significative récupérée.";
  }

  return `Mémoire utilisateur pertinente :
${memories
  .map((m, i) => `${i + 1}. [${m.category}] (importance ${m.importance}/10) ${m.content}`)
  .join("\n")}`;
}

export async function plannerAgent(
  intent: Intent,
  message: string,
): Promise<string> {
  switch (intent) {
    case "task":
      return `Transformer la demande suivante en tâches concrètes si possible : ${truncate(message, 400)}`;
    case "calendar":
      return `Identifier date, heure, sujet et préparation éventuelle pour l'événement demandé : ${truncate(message, 400)}`;
    case "search":
      return `Préparer une recherche structurée à partir de la demande : ${truncate(message, 400)}`;
    case "project":
      return "Construire une réponse orientée architecture, robustesse, modularité et étapes d'implémentation.";
    case "self_improvement":
      return "Proposer un plan d'évolution réaliste et puissant pour Rose.";
    case "goal_tracking":
      return "Identifier l'objectif, l'état actuel, le prochain jalon et l'action suivante.";
    default:
      return `Répondre de façon utile et structurée pour l'intention ${intent}.`;
  }
}

export async function autonomousPlannerAgent(
  intent: Intent,
  message: string,
): Promise<string> {
  const plan = buildAutonomousPlan({
    intent,
    message,
  });

  return `Plan autonome :
Objectif : ${plan.goal}
Stratégie : ${plan.strategy}
Étapes :
${plan.steps.map((step, i) =>
  `${i + 1}. ${step.title} (priorité ${step.priority}) — ${step.description}`
).join("\n")}`;
}

export async function executionAgent(
  intent: Intent,
  message: string,
): Promise<string> {
  const exec = await runExecutionEngine({
    intent,
    message,
  });

  return `Execution Engine :
${exec.summary}

Étapes :
${exec.executed_steps.map((s, i) =>
  `${i + 1}. ${s.step} [${s.status}] — ${s.output}`
).join("\n")}`;
}

export async function executionAgentV2(
  intent: Intent,
  message: string,
): Promise<string> {
  const exec = await runExecutionEngineV2({
    intent,
    message,
  });

  return `Execution Engine v2 :
Objectif : ${exec.objective}
Stratégie : ${exec.strategy}

Actions :
${exec.actions.map((action, i) =>
  `${i + 1}. ${action.type} [${action.status}] — ${action.reason}`
).join("\n")}

Résumé :
${exec.final_summary}`;
}

export async function executionAgentV3(
  intent: Intent,
  message: string,
): Promise<string> {
  const exec = await runExecutionEngineV3({
    intent,
    message,
  });

  return `Execution Engine v3 :
Objectif : ${exec.objective}
Stratégie : ${exec.strategy}
Itérations : ${exec.iterations}
Raison d'arrêt : ${exec.stop_reason}

Actions :
${exec.actions.map((action, i) =>
  `${i + 1}. ${action.type} [${action.status}] priorité=${action.priority} — ${action.reason}`
).join("\n")}

Résumé :
${exec.final_summary}`;
}

export async function taskAgent(
  message: string,
  intent: Intent,
): Promise<string> {
  const text = message.toLowerCase();

  if (intent !== "task" && !/tache|todo|a faire|checklist|mission/.test(text)) {
    return "Aucune tâche explicite détectée.";
  }

  return `Tâche potentielle détectée à partir de : ${truncate(message, 300)}`;
}

export async function calendarAgent(
  intent: Intent,
): Promise<string> {
  if (intent !== "calendar") {
    return "Aucun besoin calendrier prioritaire détecté.";
  }

  return "Préparer un événement candidat avec date, heure, contexte et éventuelle préparation.";
}

export async function searchAgent(
  message: string,
  intent: Intent,
): Promise<string> {
  const web = await runWebAgent(message);

  if (intent !== "search" && !web.should_search) {
    return "Pas de recherche web prioritaire demandée.";
  }

  return `Agent web :
- raison: ${web.reason}
- requête: ${web.query || "aucune"}
- résultats actuels: ${web.results.length}`;
}

export async function growthAgent(
  intent: Intent,
): Promise<string> {
  if (intent !== "self_improvement" && intent !== "project") {
    return "Pas de demande d'évolution système dominante.";
  }

  return "L'utilisateur veut une version plus puissante de Rose. Réponse attendue : architecture, modularité, mémoire, agents, sécurité, extensibilité.";
}

export async function safetyAgent(
  message: string,
  intent: Intent,
): Promise<string> {
  const text = message.toLowerCase();

  if (
    intent === "emergency" ||
    /suicide|mourir|me faire du mal|envie d en finir|je veux disparaitre/.test(text)
  ) {
    return "Risque détecté. Répondre avec soutien immédiat, encourager à contacter les secours et une personne de confiance.";
  }

  return "Aucun signal critique immédiat détecté.";
}

export function buildSelectedAgents(intent: Intent): AgentName[] {
  const agents: AgentName[] = [
    "core_agent",
    "emotion_agent",
    "summary_agent",
  ];

  if (intent === "memory") {
    agents.push("memory_agent");
  }

  if (
    ["task", "calendar", "search", "project", "self_improvement", "goal_tracking"].includes(
      intent,
    )
  ) {
    agents.push("planner_agent");
  }

  if (intent === "task") agents.push("task_agent");
  if (intent === "calendar") agents.push("calendar_agent");
  if (intent === "search") agents.push("search_agent");
  if (intent === "project" || intent === "self_improvement") {
    agents.push("growth_agent");
  }
  if (intent === "emergency") {
    agents.push("safety_agent");
  }

  return uniqueArray(agents);
}