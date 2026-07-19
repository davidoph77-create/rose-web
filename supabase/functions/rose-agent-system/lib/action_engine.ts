import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type RoseTaskRow = {
  id: number;
  scope: string | null;
  goal_id: number | null;
  title: string | null;
  priority: number | null;
  status: string | null;
  due_date: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
};

function getSupabaseAdmin() {
  const url =
    Deno.env.get("ROSE_SUPABASE_URL") ||
    Deno.env.get("SUPABASE_URL") ||
    "";

  const serviceRole =
    Deno.env.get("ROSE_SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    "";

  if (!url || !serviceRole) {
    throw new Error("Supabase admin non configuré");
  }

  return createClient(url, serviceRole);
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldCreateTask(intent: string, message: string): boolean {
  const text = normalizeText(message);

  if (
    /cree|crée|tache|tâche|todo|a faire|à faire|prochaine action|plan|roadmap|ameliore|améliore|organise|prépare|prepare|checklist/.test(
      text,
    )
  ) {
    return true;
  }

  return intent === "task" || intent === "project" || intent === "calendar";
}

function inferPriority(intent: string, message: string): number {
  const text = normalizeText(message);
  let priority = 70;

  if (intent === "task") priority = 85;
  if (intent === "project") priority = 80;
  if (intent === "calendar") priority = 78;

  if (/urgent|important|prioritaire|vite|rapidement|maintenant|critique/.test(text)) {
    priority += 10;
  }

  if (/optionnel|plus tard|quand tu peux/.test(text)) {
    priority -= 15;
  }

  return Math.max(1, Math.min(100, priority));
}

function inferScope(intent: string): string {
  switch (intent) {
    case "project":
      return "project_task";
    case "goal_tracking":
      return "goal_task";
    case "calendar":
      return "calendar_task";
    default:
      return "user_task";
  }
}

function inferDueDate(message: string): string | null {
  const text = normalizeText(message);
  const now = new Date();

  if (/demain|tomorrow/.test(text)) {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      10,
      0,
      0,
    ).toISOString();
  }

  if (/ce soir|tonight/.test(text)) {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      0,
      0,
    ).toISOString();
  }

  if (/aujourd hui|aujourdhui|today/.test(text)) {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      18,
      0,
      0,
    ).toISOString();
  }

  return null;
}

function buildTaskCandidates(intent: string, message: string): string[] {
  const text = normalizeText(message);

  if (intent === "project" || /architecture|systeme|système|roadmap/.test(text)) {
    return [
      "Analyser les besoins et les points faibles actuels",
      "Définir l'architecture cible",
      "Lister les modules à améliorer",
      "Préparer la prochaine action prioritaire",
    ];
  }

  if (intent === "calendar" || /demain|rappel|agenda|rdv|rendez vous|réunion/.test(text)) {
    return [
      "Préparer l'événement ou le rappel demandé",
      "Vérifier les informations utiles avant l'échéance",
    ];
  }

  if (/checklist|etapes|étapes|plan/.test(text)) {
    return [
      "Clarifier l'objectif exact",
      "Découper la demande en étapes",
      "Définir la première action concrète",
    ];
  }

  return [message.replace(/\s+/g, " ").trim()];
}

function uniqueCandidates(candidates: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of candidates) {
    const cleaned = item.trim();
    const normalized = normalizeText(cleaned);
    if (!cleaned || normalized.length < 4) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(cleaned.length > 160 ? cleaned.slice(0, 160) : cleaned);
  }

  return result;
}

function similarityScore(a: string, b: string): number {
  const aWords = new Set(normalizeText(a).split(" ").filter(Boolean));
  const bWords = new Set(normalizeText(b).split(" ").filter(Boolean));

  const intersection = [...aWords].filter((w) => bWords.has(w)).length;
  const denominator = Math.max(aWords.size, bWords.size, 1);

  return intersection / denominator;
}

async function findGoalId(
  supabase: ReturnType<typeof createClient>,
  message: string,
): Promise<number | null> {
  try {
    const text = normalizeText(message);

    const { data, error } = await supabase
      .from("rose_goals")
      .select("id, title")
      .limit(50);

    if (error || !data?.length) return null;

    const match = data.find((goal) =>
      normalizeText(goal.title || "").split(" ").some((word) =>
        word.length >= 4 && text.includes(word)
      )
    );

    return match?.id ?? null;
  } catch {
    return null;
  }
}

async function findExistingTasks(
  supabase: ReturnType<typeof createClient>,
): Promise<RoseTaskRow[]> {
  const { data, error } = await supabase
    .from("rose_tasks")
    .select("*")
    .limit(200);

  if (error || !data) return [];
  return data as RoseTaskRow[];
}

export async function runActionEngine(params: {
  user_id: string;
  intent: string;
  message: string;
  reply: string;
}): Promise<{
  executed: string[];
  debug: Record<string, unknown>;
}> {
  const debug: Record<string, unknown> = {};
  const executed: string[] = [];

  try {
    const supabase = getSupabaseAdmin();

    const createTask = shouldCreateTask(params.intent, params.message);
    debug.create_task_decision = createTask;
    debug.intent = params.intent;

    if (!createTask) {
      debug.skipped_reason = "shouldCreateTask=false";
      return { executed, debug };
    }

    const scope = inferScope(params.intent);
    const basePriority = inferPriority(params.intent, params.message);
    const due_date = inferDueDate(params.message);
    const goal_id = await findGoalId(supabase, params.message);

    const candidates = uniqueCandidates(
      buildTaskCandidates(params.intent, params.message),
    );

    debug.scope = scope;
    debug.base_priority = basePriority;
    debug.due_date = due_date;
    debug.goal_id = goal_id;
    debug.candidates = candidates;

    if (!candidates.length) {
      debug.skipped_reason = "Aucun candidat de tâche";
      return { executed, debug };
    }

    const existingTasks = await findExistingTasks(supabase);
    debug.existing_tasks_count = existingTasks.length;

    const inserted: RoseTaskRow[] = [];
    const updated: RoseTaskRow[] = [];
    const duplicates: RoseTaskRow[] = [];

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const candidatePriority = Math.max(1, Math.min(100, basePriority - i * 5));

      const similar = existingTasks.find((task) => {
        if (!task.title) return false;
        if (task.status === "done") return false;
        return similarityScore(task.title, candidate) >= 0.75;
      });

      if (similar) {
        const currentPriority = Number(taskPriority(similar.priority));
        const newPriority = Math.max(currentPriority, candidatePriority);

        const { data: updatedTask, error: updateError } = await supabase
          .from("rose_tasks")
          .update({
            priority: newPriority,
            due_date: similar.due_date ?? due_date,
            status: similar.status ?? "pending",
            user_id: similar.user_id ?? params.user_id,
          })
          .eq("id", similar.id)
          .select("*")
          .single();

        if (updateError) {
          if (!debug.update_errors) debug.update_errors = [];
          (debug.update_errors as unknown[]).push({
            id: similar.id,
            title: candidate,
            error: updateError.message,
          });
          continue;
        }

        updated.push(updatedTask as RoseTaskRow);
        duplicates.push(similar);
        executed.push(`task_updated:${similar.id}`);
        continue;
      }

      const { data: insertedTask, error: insertError } = await supabase
        .from("rose_tasks")
        .insert({
          scope,
          goal_id,
          title: candidate,
          priority: candidatePriority,
          status: "pending",
          due_date,
          user_id: params.user_id,
        })
        .select("*")
        .single();

      if (insertError) {
        if (!debug.insert_errors) debug.insert_errors = [];
        (debug.insert_errors as unknown[]).push({
          title: candidate,
          error: insertError.message,
        });
        continue;
      }

      inserted.push(insertedTask as RoseTaskRow);
      executed.push(`task_created:${(insertedTask as RoseTaskRow).id}`);
    }

    debug.task_inserted = inserted;
    debug.task_updated = updated;
    debug.duplicates = duplicates;

    return { executed, debug };
  } catch (error) {
    debug.exception = error instanceof Error ? error.message : String(error);
    return { executed, debug };
  }
}

function taskPriority(value: number | null | undefined): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return 0;
}