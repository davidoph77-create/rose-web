import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "https://esm.sh/openai@4.56.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

const supabase = createClient(
  Deno.env.get("ROSE_SUPABASE_URL") || "",
  Deno.env.get("ROSE_SUPABASE_SERVICE_ROLE_KEY") || ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

async function getMemory(userId: string) {
  const { data } = await supabase
    .from("rose_memory")
    .select("summary, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
}

async function saveMemory(userId: string, content: string) {
  if (!content || content.length < 10) return;

  await supabase.from("rose_memory").insert({
    user_id: userId,
    role: "assistant",
    content,
    summary: content.slice(0, 160),
    source: "auto_loop_cloud",
    scope: "autonomous_cloud",
    importance: 0.9,
  });
}

async function saveGoal(userId: string, title: string) {
  if (!title) return;

  await supabase.from("rose_goals").insert({
    user_id: userId,
    title,
    status: "active",
    scope: "cloud_autonomy",
    priority: 0.9,
  });
}

async function saveTask(userId: string, title: string) {
  if (!title) return;

  await supabase.from("rose_tasks").insert({
    user_id: userId,
    title,
    status: "todo",
    scope: "cloud_autonomy",
    priority: 0.85,
  });
}

async function saveLog(userId: string, content: string) {
  await supabase.from("rose_autonomy_logs").insert({
    user_id: userId,
    content,
    source: "rose_cloud_v5",
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const userId = String(body.user_id || "david");

    const memory = await getMemory(userId);

    const memoryText =
      memory
        .map((m: any) => `- ${m.summary || m.content || ""}`)
        .filter(Boolean)
        .join("\n") || "Aucune mémoire.";

    const prompt = `
Tu es Rose IA Cloud Autonome V5.

Tu réfléchis seule pour aider David à avancer.

Contexte important :
- David développe Rose IA mobile + PC.
- Il veut une IA avec mémoire, voix, objectifs, tâches, roadmap et autonomie.
- Il travaille en couverture/charpente.
- Il vise une progression financière vers 8000€/mois.
- Il veut une IA utile, concrète, pratique et évolutive.

Mémoire récente :
${memoryText}

Ta mission cloud :
1. analyser la situation
2. proposer une prochaine action utile
3. créer une tâche concrète
4. éventuellement créer un objectif
5. mémoriser une synthèse utile

Réponds UNIQUEMENT en JSON valide :

{
  "reply": "message court pour l'utilisateur",
  "goal": "objectif utile ou null",
  "task": "tâche concrète ou null",
  "memory": "mémoire utile à sauvegarder",
  "next_action": "prochaine action recommandée",
  "priority": 0.0
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [{ role: "system", content: prompt }],
    });

    const raw = completion.choices[0]?.message?.content || "{}";

    let result: any;
    try {
      result = JSON.parse(raw);
    } catch {
      result = {
        reply: raw,
        goal: null,
        task: "Relire la dernière avancée de Rose et choisir la prochaine action.",
        memory: raw,
        next_action: "Continuer l'amélioration de Rose IA.",
        priority: 0.7,
      };
    }

    if (result.memory) await saveMemory(userId, String(result.memory));
    if (result.goal) await saveGoal(userId, String(result.goal));
    if (result.task) await saveTask(userId, String(result.task));
    if (result.next_action) await saveTask(userId, "⚡ " + String(result.next_action));

    await saveLog(userId, JSON.stringify(result));

    return json({
      ok: true,
      source: "rose_cloud_autonomous_v5",
      result,
    });
  } catch (e) {
    return json(
      {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      },
      500
    );
  }
});