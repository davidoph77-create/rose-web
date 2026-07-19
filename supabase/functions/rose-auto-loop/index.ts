import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("ROSE_SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("ROSE_SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function json(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function clean(v: unknown) {
  return String(v || "").trim().replace(/\s+/g, " ");
}

async function recent(table: string, userId: string, limit = 20) {
  const { data } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}

async function insert(table: string, payload: any) {
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) console.log(`${table} error =`, error);
  return data;
}

function parseJson(text: string) {
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

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = String(body.user_id || "david");

    if (!OPENAI_API_KEY) return json({ ok: false, error: "OPENAI_API_KEY manquante" });
    if (!SUPABASE_URL || !SUPABASE_KEY) return json({ ok: false, error: "Secrets Supabase manquants" });

    const [
      memory,
      tasks,
      goals,
      agents,
      roadmap,
      learning,
      evolution,
      webRequests,
      webResults,
      homeActions,
      business,
      improvements,
      calendarActions,
      agentMemory,
    ] = await Promise.all([
      recent("rose_memory", userId, 20),
      recent("rose_tasks", userId, 25),
      recent("rose_goals", userId, 15),
      recent("rose_agents", userId, 20),
      recent("rose_roadmap_auto", userId, 15),
      recent("rose_learning_log", userId, 15),
      recent("rose_evolution", userId, 5),
      recent("rose_web_requests", userId, 10),
      recent("rose_web_results", userId, 10),
      recent("rose_home_actions", userId, 10),
      recent("rose_business_tracking", userId, 10),
      recent("rose_improvements", userId, 10),
      recent("rose_calendar_actions", userId, 10),
      recent("rose_agent_memory", userId, 10),
    ]);

    const prompt = `
Tu es ROSE ULTIMATE V8.

Tu es une IA personnelle multi-agents pour David.

Modules V8 :
1. Orchestrateur central
2. Agent Mémoire
3. Agent Objectifs
4. Agent Tâches
5. Agent Business
6. Agent Chantier couverture/charpente
7. Agent Web SAFE
8. Agent Domotique SAFE
9. Agent Agenda SAFE
10. Agent Evolution
11. Agent Sécurité
12. Mémoire agent spécialisée

Règles de sécurité :
- Ne jamais prétendre avoir exécuté une action externe.
- Web : créer une recherche à faire ou un résultat à valider, pas inventer une vraie recherche.
- Domotique : toujours needs_validation.
- Agenda : toujours needs_validation.
- Actions sensibles : validation humaine obligatoire.
- Tu peux proposer, mémoriser, planifier, prioriser et améliorer.
- Réponse courte, concrète, utile.

Contexte David :
- Il développe Rose IA mobile + PC.
- Il veut Rose autonome, qui apprend et s'améliore.
- Il travaille en couverture/charpente.
- Il vise 8000€/mois.
- Il veut plus tard contrôler la domotique.
- Il veut que Rose puisse chercher et s'améliorer toute seule sous contrôle.

Mémoire récente :
${memory.map((m: any) => "- " + (m.summary || m.content)).join("\n") || "Aucune"}

Tâches récentes :
${tasks.map((t: any) => "- " + (t.title || t.content)).join("\n") || "Aucune"}

Objectifs récents :
${goals.map((g: any) => "- " + g.title).join("\n") || "Aucun"}

Agents récents :
${agents.map((a: any) => "- " + a.agent_name + " : " + a.last_output).join("\n") || "Aucun"}

Roadmap :
${roadmap.map((r: any) => "- " + r.title).join("\n") || "Aucune"}

Apprentissages :
${learning.map((l: any) => "- " + l.lesson).join("\n") || "Aucun"}

Evolution :
${evolution.map((e: any) => "- " + e.global_score + " : " + e.summary).join("\n") || "Aucune"}

Web requests :
${webRequests.map((w: any) => "- " + w.query).join("\n") || "Aucune"}

Web results :
${webResults.map((w: any) => "- " + w.query + " : " + w.result).join("\n") || "Aucun"}

Domotique :
${homeActions.map((h: any) => "- " + h.action).join("\n") || "Aucune"}

Business :
${business.map((b: any) => "- " + b.metric + " : " + b.recommendation).join("\n") || "Aucun"}

Améliorations :
${improvements.map((i: any) => "- " + i.improvement).join("\n") || "Aucune"}

Agenda :
${calendarActions.map((c: any) => "- " + c.title + " : " + c.date_text).join("\n") || "Aucun"}

Mémoire agents :
${agentMemory.map((a: any) => "- " + a.agent_name + " : " + a.memory).join("\n") || "Aucune"}

Réponds uniquement en JSON valide :

{
  "reply": "message court pour David",
  "mood": "stable|focused|motivated|planning|creative|excited",
  "focus": "focus actuel",
  "reflection": "réflexion interne courte",

  "agents": [
    {
      "agent_name": "Agent Mémoire",
      "role": "mission",
      "output": "résultat utile",
      "priority": 0.8
    }
  ],

  "agent_memory": [
    {
      "agent_name": "Agent Business",
      "memory": "mémoire spécialisée",
      "importance": 0.8
    }
  ],

  "goals": [
    {
      "title": "objectif clair",
      "category": "rose|business|chantier|organisation|domotique|web|agenda",
      "priority": 0.8,
      "progress": 0,
      "next_action": "action suivante"
    }
  ],

  "tasks": [
    {
      "title": "tâche concrète",
      "priority": 0.8,
      "reason": "raison IA",
      "impact": "low|medium|high"
    }
  ],

  "roadmap": [
    {
      "title": "étape roadmap",
      "phase": "v8",
      "priority": 0.8,
      "next_action": "action suivante"
    }
  ],

  "web_requests": [
    {
      "query": "recherche à préparer",
      "source": "agent_web_v8"
    }
  ],

  "web_results": [
    {
      "query": "sujet",
      "result": "résumé proposé ou à valider",
      "status": "pending"
    }
  ],

  "home_actions": [
    {
      "action": "action domotique proposée",
      "device": "appareil",
      "room": "pièce",
      "risk_level": "medium"
    }
  ],

  "calendar_actions": [
    {
      "title": "rappel ou action agenda proposée",
      "date_text": "date ou moment proposé"
    }
  ],

  "business_tracking": [
    {
      "metric": "revenu|clients|devis|chantier|rentabilité",
      "value": "valeur actuelle",
      "target": "objectif",
      "recommendation": "recommandation business"
    }
  ],

  "improvements": [
    {
      "improvement": "amélioration Rose",
      "reason": "raison"
    }
  ],

  "evolution": {
    "autonomy_score": 0.85,
    "memory_score": 0.85,
    "task_score": 0.85,
    "goal_score": 0.85,
    "decision_score": 0.85,
    "global_score": 0.85,
    "summary": "résumé évolution"
  },

  "memory": "mémoire utile",
  "decision": "décision proposée ou null",
  "reason": "raison de la décision",
  "risk_level": "low|medium|high",
  "lesson": "apprentissage utile"
}
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.38,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: prompt }],
      }),
    });

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content || "{}";
    const result = parseJson(raw) || {};

    const created: any = {
      state: null,
      agents: [],
      agent_memory: [],
      goals: [],
      tasks: [],
      roadmap: [],
      web_requests: [],
      web_results: [],
      home_actions: [],
      calendar_actions: [],
      business_tracking: [],
      improvements: [],
      evolution: null,
      memory: null,
      decision: null,
      learning: null,
    };

    created.state = await insert("rose_self_state", {
      user_id: userId,
      mood: clean(result.mood || "focused"),
      focus: clean(result.focus || "Ultimate V8"),
      autonomy_level: "ultimate_v8",
      last_reflection: clean(result.reflection || ""),
    });

    for (const a of Array.isArray(result.agents) ? result.agents.slice(0, 12) : []) {
      const row = await insert("rose_agents", {
        user_id: userId,
        agent_name: clean(a.agent_name || "Agent Rose"),
        role: clean(a.role || ""),
        status: "active",
        last_output: clean(a.output || ""),
        priority: Number(a.priority ?? 0.8),
      });
      if (row) created.agents.push(row);
    }

    for (const am of Array.isArray(result.agent_memory) ? result.agent_memory.slice(0, 8) : []) {
      const row = await insert("rose_agent_memory", {
        user_id: userId,
        agent_name: clean(am.agent_name || "Agent Rose"),
        memory: clean(am.memory),
        importance: Number(am.importance ?? 0.8),
      });
      if (row) created.agent_memory.push(row);
    }

    for (const g of Array.isArray(result.goals) ? result.goals.slice(0, 3) : []) {
      const row = await insert("rose_goals", {
        user_id: userId,
        title: clean(g.title),
        category: clean(g.category || "rose"),
        priority: Number(g.priority ?? 0.8),
        progress: Number(g.progress ?? 0),
        next_action: clean(g.next_action || ""),
        status: "active",
        updated_at: new Date().toISOString(),
      });
      if (row) created.goals.push(row);
    }

    for (const t of Array.isArray(result.tasks) ? result.tasks.slice(0, 5) : []) {
      const title = clean(t.title);
      if (!title) continue;
      const row = await insert("rose_tasks", {
        user_id: userId,
        title,
        content: title,
        status: "todo",
        scope: "ultimate_v8",
        priority: Number(t.priority ?? 0.8),
        priority_score: Number(t.priority ?? 0.8),
        ai_reason: clean(t.reason || ""),
        estimated_impact: clean(t.impact || "medium"),
      });
      if (row) created.tasks.push(row);
    }

    for (const r of Array.isArray(result.roadmap) ? result.roadmap.slice(0, 5) : []) {
      const row = await insert("rose_roadmap_auto", {
        user_id: userId,
        title: clean(r.title),
        phase: clean(r.phase || "v8"),
        priority: Number(r.priority ?? 0.8),
        status: "todo",
        next_action: clean(r.next_action || ""),
      });
      if (row) created.roadmap.push(row);
    }

    for (const w of Array.isArray(result.web_requests) ? result.web_requests.slice(0, 4) : []) {
      const query = clean(w.query);
      if (!query) continue;
      const row = await insert("rose_web_requests", {
        user_id: userId,
        query,
        status: "pending",
        source: clean(w.source || "agent_web_v8"),
      });
      if (row) created.web_requests.push(row);
    }

    for (const wr of Array.isArray(result.web_results) ? result.web_results.slice(0, 3) : []) {
      const query = clean(wr.query);
      if (!query) continue;
      const row = await insert("rose_web_results", {
        user_id: userId,
        query,
        result: clean(wr.result || ""),
        status: clean(wr.status || "pending"),
      });
      if (row) created.web_results.push(row);
    }

    for (const h of Array.isArray(result.home_actions) ? result.home_actions.slice(0, 3) : []) {
      const action = clean(h.action);
      if (!action) continue;
      const row = await insert("rose_home_actions", {
        user_id: userId,
        action,
        device: clean(h.device || ""),
        room: clean(h.room || ""),
        status: "needs_validation",
        risk_level: clean(h.risk_level || "medium"),
      });
      if (row) created.home_actions.push(row);
    }

    for (const c of Array.isArray(result.calendar_actions) ? result.calendar_actions.slice(0, 3) : []) {
      const title = clean(c.title);
      if (!title) continue;
      const row = await insert("rose_calendar_actions", {
        user_id: userId,
        title,
        date_text: clean(c.date_text || ""),
        status: "needs_validation",
      });
      if (row) created.calendar_actions.push(row);
    }

    for (const b of Array.isArray(result.business_tracking) ? result.business_tracking.slice(0, 4) : []) {
      const row = await insert("rose_business_tracking", {
        user_id: userId,
        metric: clean(b.metric),
        value: clean(b.value || ""),
        target: clean(b.target || ""),
        recommendation: clean(b.recommendation || ""),
      });
      if (row) created.business_tracking.push(row);
    }

    for (const im of Array.isArray(result.improvements) ? result.improvements.slice(0, 4) : []) {
      const row = await insert("rose_improvements", {
        user_id: userId,
        improvement: clean(im.improvement),
        reason: clean(im.reason || ""),
        status: "proposed",
      });
      if (row) created.improvements.push(row);
    }

    if (result.evolution) {
      created.evolution = await insert("rose_evolution", {
        user_id: userId,
        autonomy_score: Number(result.evolution.autonomy_score ?? 0.85),
        memory_score: Number(result.evolution.memory_score ?? 0.85),
        task_score: Number(result.evolution.task_score ?? 0.85),
        goal_score: Number(result.evolution.goal_score ?? 0.85),
        decision_score: Number(result.evolution.decision_score ?? 0.85),
        global_score: Number(result.evolution.global_score ?? 0.85),
        summary: clean(result.evolution.summary || "Rose Ultimate V8 évolue."),
      });
    }

    if (result.memory) {
      created.memory = await insert("rose_memory", {
        user_id: userId,
        role: "assistant",
        content: clean(result.memory),
        summary: clean(result.memory).slice(0, 180),
        source: "rose_ultimate_v8",
        scope: "long_term",
        importance: 0.95,
      });
    }

    if (result.decision && clean(result.decision).toLowerCase() !== "null") {
      created.decision = await insert("rose_decisions", {
        user_id: userId,
        decision: clean(result.decision),
        reason: clean(result.reason || ""),
        risk_level: clean(result.risk_level || "low"),
        status: clean(result.risk_level || "low") === "low" ? "proposed" : "needs_validation",
      });
    }

    if (result.lesson) {
      created.learning = await insert("rose_learning_log", {
        user_id: userId,
        lesson: clean(result.lesson),
        source: "ultimate_v8",
      });
    }

    return json({
      ok: true,
      source: "rose_ultimate_v8",
      user_id: userId,
      result,
      created,
    });
  } catch (e) {
    return json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    });
  }
});