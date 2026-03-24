import { detectIntent } from "./intent.ts";
import { detectMood, detectMoodScore } from "./mood.ts";
import { inferActions } from "./actions.ts";
import { summarizeConversation } from "./summary.ts";
import {
  emotionAgent,
  memoryAgent,
  plannerAgent,
  taskAgent,
  calendarAgent,
  searchAgent,
  growthAgent,
  safetyAgent,
  buildSelectedAgents,
  autonomousPlannerAgent,
  executionAgent,
  executionAgentV2,
  executionAgentV3,
} from "./agents.ts";
import {
  saveMemory,
  shouldSaveMemory,
  saveConversation,
} from "./memory.ts";
import { callLLM } from "./llm.ts";
import {
  OrchestratorInput,
  OrchestratorOutput,
} from "./types.ts";
import { runWebAgent } from "./web_agent.ts";

export async function orchestrateRose(
  input: OrchestratorInput,
): Promise<OrchestratorOutput> {
  const mood = detectMood(input.message);
  const mood_score = detectMoodScore(input.message);
  const intent = detectIntent(input.message);

  const actions = inferActions(intent);
  const selected_agents = buildSelectedAgents(intent);

  const summary = summarizeConversation(
    input.message,
    input.history ?? [],
    intent,
  );

  const memory_context = await memoryAgent(input.user_id, input.message);
  const emotion_context = await emotionAgent(mood, mood_score);
  const planner_context = await plannerAgent(intent, input.message);
  const task_context = await taskAgent(input.message, intent);
  const calendar_context = await calendarAgent(intent);
  const search_context = await searchAgent(input.message, intent);
  const growth_context = await growthAgent(intent);
  const safety_context = await safetyAgent(input.message, intent);
  const autonomous_plan_context = await autonomousPlannerAgent(intent, input.message);
  const execution_context = await executionAgent(intent, input.message);
  const execution_v2_context = await executionAgentV2(intent, input.message);
  const execution_v3_context = await executionAgentV3(intent, input.message);

  const web_agent = await runWebAgent(input.message);

  const system_prompt = `
Tu es Rose, une IA personnelle intelligente, chaleureuse, bienveillante et cohérente.

RÈGLES IMPORTANTES :
- Tu peux utiliser la mémoire utilisateur pour répondre de façon plus pertinente.
- Si une information est déjà connue, tu peux dire naturellement : "Je me souviens que..."
- Ne dis jamais que tu ne peux pas mémoriser : la mémoire est gérée par le système.
- Réponds de manière naturelle, claire, utile, structurée et sans répétition inutile.
- Si une recherche web semble utile, tu peux le dire clairement et proposer la requête pertinente.
- Si une demande est complexe, appuie-toi sur le plan autonome, l'execution engine, l'execution engine v2 et l'execution engine v3.
- Si utile, présente la réponse sous forme d'étapes concrètes.
- Quand l'utilisateur demande une amélioration, propose une suite exploitable.

CONTEXTE ÉMOTION :
${emotion_context}

MÉMOIRE UTILISATEUR :
${memory_context}

ANALYSE :
${planner_context}

PLAN AUTONOME :
${autonomous_plan_context}

EXECUTION ENGINE :
${execution_context}

EXECUTION ENGINE V2 :
${execution_v2_context}

EXECUTION ENGINE V3 :
${execution_v3_context}

TÂCHES :
${task_context}

CALENDRIER :
${calendar_context}

RECHERCHE :
${search_context}

AGENT WEB :
- should_search: ${web_agent.should_search}
- reason: ${web_agent.reason}
- query: ${web_agent.query || "aucune"}
- results_count: ${web_agent.results.length}

ÉVOLUTION SYSTÈME :
${growth_context}

SÉCURITÉ :
${safety_context}

RÉSUMÉ CONVERSATION :
${summary.short_summary}

POINTS CLÉS :
${summary.key_points.join(", ") || "aucun"}

BESOINS UTILISATEUR :
${summary.user_needs.join(", ") || "réponse utile"}

ACTIONS :
${actions.map((a) => a.type).join(", ") || "aucune"}

INSTRUCTION FINALE :
- Si la mémoire contient une information utile, utilise-la dans la réponse.
- Si l'utilisateur demande ce que tu sais sur son projet, réponds directement avec les éléments les plus utiles.
- Si plusieurs souvenirs proches existent, synthétise-les sans te répéter.
- Si une recherche web est pertinente, formule-la clairement dans la réponse.
- Si un plan autonome est utile, structure naturellement la réponse en étapes.
- Si l'execution engine, v2 ou v3 est utile, utilise leurs étapes pour proposer une suite concrète.
- Réponds comme une vraie IA personnelle avancée, pas comme un simple chatbot.

Réponds maintenant à l'utilisateur.
`.trim();

  const reply = await callLLM({
    system: system_prompt,
    history: input.history ?? [],
    user: input.message,
  });

  let memory_saved = false;
  let memory_error: string | null = null;
  let memory_debug: Record<string, unknown> | null = null;

  if (shouldSaveMemory(input.message, intent)) {
    const result = await saveMemory(
      input.user_id,
      input.message,
      intent,
    );

    memory_saved = result.ok;
    memory_error = result.error ?? null;
    memory_debug = result.debug ?? null;
  }

  await saveConversation({
    user_id: input.user_id,
    conversation_id: input.conversation_id ?? null,
    user_message: input.message,
    assistant_reply: reply,
    mood,
    mood_score,
    intent,
    summary,
  });

  return {
    ok: true,
    source: "rose_execution_engine_v3_enabled",
    reply,
    mood,
    intent,
    selected_agents,
    actions,
    memory_saved,
    conversation_summary: summary,
    debug: {
      memory_error,
      memory_debug,
      mood_score,
      selected_agents_count: selected_agents.length,
      memory_context,
      web_agent,
      autonomous_plan_context,
      execution_context,
      execution_v2_context,
      execution_v3_context,
    },
  };
}