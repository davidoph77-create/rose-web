// supabase/functions/rose-agent-system/lib/goal_engine.ts

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type GoalEngineDebug = {
  create_goal_decision: boolean;
  intent: string | null;
  goal_title: string | null;
  goal_description: string | null;
  goal_insert_error: string | null;
  exception: string | null;
};

type GoalEngineResult = {
  goal_created: boolean;
  goal: Record<string, unknown> | null;
  debug: GoalEngineDebug;
};

function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function runGoalEngine(
  supabase: SupabaseClient,
  user_id: string,
  message: string,
): Promise<GoalEngineResult> {
  const debug: GoalEngineDebug = {
    create_goal_decision: false,
    intent: null,
    goal_title: null,
    goal_description: null,
    goal_insert_error: null,
    exception: null,
  };

  try {
    const safeMessage = String(message ?? "").trim();
    const lower = normalizeText(safeMessage);

    const isProject =
      lower.includes("objectif") ||
      lower.includes("goal") ||
      lower.includes("roadmap") ||
      lower.includes("ameliorer") ||
      lower.includes("améliorer") ||
      lower.includes("architecture") ||
      lower.includes("systeme ia") ||
      lower.includes("système ia") ||
      lower.includes("rose");

    if (!isProject) {
      return {
        goal_created: false,
        goal: null,
        debug,
      };
    }

    debug.create_goal_decision = true;
    debug.intent = "project";

    const goal_title = "Objectif principal : améliorer le système Rose AI";
    const goal_description = [
      "Améliorer l'architecture du système IA Rose de manière progressive, propre et évolutive.",
      "",
      "Objectifs :",
      "- Structurer les agents",
      "- Optimiser la mémoire",
      "- Améliorer les performances",
      "- Permettre une autonomie croissante",
    ].join("\n");

    debug.goal_title = goal_title;
    debug.goal_description = goal_description;

    const payload = {
      user_id,
      scope: "goal",
      title: goal_title,
      description: goal_description,
      priority: 0.5,
      progress: 0,
      status: "active",
    };

    const { data, error } = await supabase
      .from("rose_goals")
      .insert(payload)
      .select()
      .single();

    if (error) {
      debug.goal_insert_error = error.message;

      return {
        goal_created: false,
        goal: null,
        debug,
      };
    }

    return {
      goal_created: true,
      goal: data,
      debug,
    };
  } catch (err) {
    debug.exception = err instanceof Error ? err.message : String(err);

    return {
      goal_created: false,
      goal: null,
      debug,
    };
  }
}