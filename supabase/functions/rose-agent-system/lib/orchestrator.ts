import OpenAI from "https://esm.sh/openai@4.28.0";

type MemoryItem = {
  summary?: string | null;
  content?: string | null;
};

export type OrchestratorResult = {
  reply: string;
  goal: string | null;
  task: string | null;
  plan: string | null;
  roadmap: string | null;
  mood: string | null;
  priority: number;
  autonomous_suggestion: string | null;
  next_action: string | null;
  should_save_memory: boolean;
  autonomy_level: "low" | "medium" | "high" | "ultimate";
  business_advice: string | null;
  daily_plan: string | null;
  rose_improvement: string | null;
};

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v.length > 0 ? v : null;
}

function cleanNumber(value: unknown): number {
  const n = Number(value);
  if (Number.isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function memoryToText(memory: MemoryItem[] = []) {
  const items = memory
    .map((m) => cleanString(m.summary) || cleanString(m.content))
    .filter(Boolean)
    .slice(0, 20);

  if (!items.length) return "Aucune mémoire disponible.";

  return items.map((m) => `- ${m}`).join("\n");
}

function parseJsonSafe(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function fallback(input: string): OrchestratorResult {
  return {
    reply:
      "Je suis là 💜 Je peux t’aider à transformer ça en objectif clair, en plan d’action et en prochaines étapes concrètes.",
    goal: input.length > 8 ? input : null,
    task: input.length > 8 ? "Clarifier la prochaine étape utile." : null,
    plan:
      "1. Clarifier l’objectif\n2. Définir la priorité\n3. Choisir une action simple à faire aujourd’hui",
    roadmap:
      "Étape 1 : diagnostic\nÉtape 2 : plan\nÉtape 3 : action\nÉtape 4 : suivi",
    mood: "supportive",
    priority: 0.6,
    autonomous_suggestion:
      "Je te conseille de commencer par une action petite mais concrète maintenant.",
    next_action: "Définir exactement le résultat que tu veux obtenir.",
    should_save_memory: false,
    autonomy_level: "medium",
    business_advice: null,
    daily_plan: null,
    rose_improvement:
      "Améliorer la mémoire et l’organisation des tâches de Rose.",
  };
}

export async function runOrchestrator(
  input: string,
  memory: MemoryItem[] = []
): Promise<OrchestratorResult> {
  const userInput = String(input || "").trim();

  if (!userInput) {
    return {
      reply: "Je suis là 💜 Dis-moi ce que tu veux faire.",
      goal: null,
      task: null,
      plan: null,
      roadmap: null,
      mood: "waiting",
      priority: 0.2,
      autonomous_suggestion: null,
      next_action: null,
      should_save_memory: false,
      autonomy_level: "low",
      business_advice: null,
      daily_plan: null,
      rose_improvement: null,
    };
  }

  try {
    const memoryText = memoryToText(memory);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.68,
      messages: [
        {
          role: "system",
          content: `
Tu es Rose IA, une assistante personnelle autonome avancée, douce, féminine, intelligente, motivante et structurée.

MODE ULTIME V4 :
Tu ne fais pas seulement du chat.
Tu analyses, priorises, planifies, proposes, mémorises et aides l'utilisateur à avancer.

Contexte utilisateur important probable :
- L'utilisateur développe une IA personnelle appelée Rose.
- Il veut une application mobile + PC.
- Il veut une IA avec voix, mémoire, tâches, objectifs, roadmap et autonomie.
- Il travaille dans la couverture/charpente, souvent seul.
- Il veut améliorer ses revenus, environ de 3000€ vers 8000€.
- Il aime les réponses directes, pratiques, prêtes à coller quand il code.

Tu dois pouvoir aider sur 4 axes :
1. Projet Rose IA : architecture, code, debug, roadmap, auto-amélioration.
2. Business / argent : objectifs, sous-traitance, clients, prix, actions rentables.
3. Organisation quotidienne : planning, tâches, priorités, chantier.
4. Autonomie IA : mémoire, objectifs, boucle de réflexion, actions proposées.

Règles importantes :
- Réponds en français naturel.
- Sois claire, utile, concrète.
- Ne prétends jamais avoir exécuté une action externe réelle si elle n’est pas faite.
- Tu peux proposer une action autonome, mais pas dire que tu l’as faite si le système ne l’a pas réellement exécutée.
- Ne donne pas de promesse irréaliste.
- Priorise toujours la prochaine action concrète.
- Utilise la mémoire si utile.

Mémoire disponible :
${memoryText}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte autour :

{
  "reply": "réponse visible dans l'application",
  "goal": "objectif principal ou null",
  "task": "tâche prioritaire ou null",
  "plan": "plan court en étapes ou null",
  "roadmap": "roadmap courte si utile ou null",
  "mood": "calm|supportive|motivating|planning|urgent|creative|waiting",
  "priority": 0.0,
  "autonomous_suggestion": "suggestion proactive ou null",
  "next_action": "prochaine action concrète ou null",
  "should_save_memory": true,
  "autonomy_level": "low|medium|high|ultimate",
  "business_advice": "conseil business utile ou null",
  "daily_plan": "planning court si utile ou null",
  "rose_improvement": "amélioration technique de Rose si utile ou null"
}

Règles JSON :
- reply doit toujours être rempli.
- priority doit être entre 0 et 1.
- should_save_memory true seulement si l'information est utile plus tard.
- autonomy_level ultimate si tu fournis objectif + tâche + plan + next_action.
- Utilise null réel, jamais "null" en texte.
`,
        },
        { role: "user", content: userInput },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const parsed = parseJsonSafe(raw);

    if (!parsed) return fallback(userInput);

    const level = parsed.autonomy_level;
    const autonomyLevel =
      level === "ultimate" ||
      level === "high" ||
      level === "medium" ||
      level === "low"
        ? level
        : "medium";

    return {
      reply:
        cleanString(parsed.reply) ||
        "Je suis là 💜 Je peux t’aider à avancer étape par étape.",
      goal: cleanString(parsed.goal),
      task: cleanString(parsed.task),
      plan: cleanString(parsed.plan),
      roadmap: cleanString(parsed.roadmap),
      mood: cleanString(parsed.mood) || "supportive",
      priority: cleanNumber(parsed.priority),
      autonomous_suggestion: cleanString(parsed.autonomous_suggestion),
      next_action: cleanString(parsed.next_action),
      should_save_memory:
        typeof parsed.should_save_memory === "boolean"
          ? parsed.should_save_memory
          : true,
      autonomy_level: autonomyLevel,
      business_advice: cleanString(parsed.business_advice),
      daily_plan: cleanString(parsed.daily_plan),
      rose_improvement: cleanString(parsed.rose_improvement),
    };
  } catch (e) {
    console.log("orchestrator V4 ultime error =", e);
    return fallback(userInput);
  }
}