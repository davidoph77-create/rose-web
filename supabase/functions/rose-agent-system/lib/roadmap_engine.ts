// supabase/functions/rose-agent-system/lib/roadmap_engine.ts

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type RoadmapEngineDebug = {
  create_roadmap_decision: boolean;
  intent: string | null;
  roadmap_title: string | null;
  roadmap_steps: string[];
  title_column: string;
  content_column: string;
  roadmap_insert_error: string | null;
  roadmap_inserted: Record<string, unknown> | null;
  roadmap_tasks_created: Record<string, unknown>[];
  roadmap_task_errors: string[];
  exception: string | null;
};

type RoadmapEngineResult = {
  roadmap_created: boolean;
  roadmap: Record<string, unknown> | null;
  debug: RoadmapEngineDebug;
};

function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function runRoadmapEngine(
  supabase: SupabaseClient,
  user_id: string,
  message: string,
): Promise<RoadmapEngineResult> {
  const debug: RoadmapEngineDebug = {
    create_roadmap_decision: false,
    intent: null,
    roadmap_title: null,
    roadmap_steps: [],
    title_column: "title",
    content_column: "content",
    roadmap_insert_error: null,
    roadmap_inserted: null,
    roadmap_tasks_created: [],
    roadmap_task_errors: [],
    exception: null,
  };

  try {
    const safeMessage = String(message ?? "").trim();
    const lower = normalizeText(safeMessage);

    const isProject =
      lower.includes("objectif") ||
      lower.includes("roadmap") ||
      lower.includes("ameliorer") ||
      lower.includes("améliorer") ||
      lower.includes("architecture") ||
      lower.includes("systeme ia") ||
      lower.includes("système ia") ||
      lower.includes("rose");

    if (!isProject) {
      return {
        roadmap_created: false,
        roadmap: null,
        debug,
      };
    }

    debug.create_roadmap_decision = true;
    debug.intent = "project";

    const roadmap_title =
      "Roadmap : améliorer l'architecture de mon système IA";

    const roadmap_steps = [
      "Analyser l'existant",
      "Définir l'architecture cible",
      "Prioriser les modules à améliorer",
      "Préparer la mise en œuvre",
    ];

    const roadmap_content = roadmap_steps
      .map((step, index) => `${index + 1}. ${step}`)
      .join("\n");

    debug.roadmap_title = roadmap_title;
    debug.roadmap_steps = roadmap_steps;

    const { data, error } = await supabase
      .from("rose_roadmaps")
      .insert({
        user_id,
        title: roadmap_title,
        content: roadmap_content,
      })
      .select()
      .single();

    if (error) {
      debug.roadmap_insert_error = error.message;

      return {
        roadmap_created: false,
        roadmap: null,
        debug,
      };
    }

    debug.roadmap_inserted = data as Record<string, unknown>;

    const roadmapId =
      data && typeof data === "object" && "id" in data
        ? String((data as { id: unknown }).id)
        : null;

    for (const [index, step] of roadmap_steps.entries()) {
      const priority = Math.max(90 - index * 5, 60);

      const { data: taskData, error: taskError } = await supabase
        .from("rose_tasks")
        .insert({
          user_id,
          scope: "roadmap_task",
          goal_id: null,
          roadmap_id: roadmapId,
          title: step,
          content: `Étape roadmap #${index + 1}`,
          priority,
          status: "pending",
          due_date: null,
        })
        .select()
        .single();

      if (taskError) {
        debug.roadmap_task_errors.push(taskError.message);
      } else {
        debug.roadmap_tasks_created.push(taskData as Record<string, unknown>);
      }
    }

    return {
      roadmap_created: true,
      roadmap: data as Record<string, unknown>,
      debug,
    };
  } catch (err) {
    debug.exception = err instanceof Error ? err.message : String(err);

    return {
      roadmap_created: false,
      roadmap: null,
      debug,
    };
  }
}