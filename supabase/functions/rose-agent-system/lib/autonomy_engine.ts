import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function runAutonomyEngine(
  supabase: SupabaseClient,
  user_id: string,
  message: string
) {
  const debug: Record<string, unknown> = {
    detected_mode: "autonomous_project",
    matched_keywords: [],
    plan_steps_generated: [],
    execution_enabled: true,
    exception: null,
  };

  try {
    const lower = String(message ?? "").toLowerCase();

    const matchedKeywords = [
      "objectif",
      "roadmap",
      "feuille de route",
      "tâche",
      "améliore",
      "ameliore",
      "système ia",
      "rose",
    ].filter((k) => lower.includes(k));

    debug.matched_keywords = matchedKeywords;

    const hasProjectIntent = matchedKeywords.length > 0;

    if (!hasProjectIntent) {
      return {
        autonomy_mode: false,
        next_action: null,
        next_actions: [],
        debug,
      };
    }

    const nextActions = [
      "Créer les tâches roadmap prioritaires",
      "Sauvegarder le contexte utile en mémoire",
      "Maintenir une boucle objectif → roadmap → tâches",
    ];

    debug.plan_steps_generated = nextActions;

    const { data: latestGoal } = await supabase
      .from("rose_goals")
      .select("*")
      .eq("user_id", user_id)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: latestRoadmap } = await supabase
      .from("rose_roadmaps")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestRoadmap) {
      const { data: existingTasks } = await supabase
        .from("rose_tasks")
        .select("*")
        .eq("user_id", user_id)
        .eq("scope", "execution_task")
        .order("id", { ascending: false })
        .limit(2);

      if (!existingTasks || existingTasks.length === 0) {
        await supabase.from("rose_tasks").insert({
          user_id,
          scope: "execution_task",
          goal_id: latestGoal?.id ?? null,
          title: "Créer les tâches roadmap prioritaires",
          priority: 95,
          status: "pending",
          due_date: null,
          content: "Tâche créée automatiquement par Rose autonomie.",
          roadmap_id: latestRoadmap.id,
        });
      }
    }

    return {
      autonomy_mode: true,
      next_action: "Créer les tâches roadmap prioritaires",
      next_actions: nextActions,
      debug,
    };
  } catch (err) {
    debug.exception = err instanceof Error ? err.message : String(err);

    return {
      autonomy_mode: false,
      next_action: null,
      next_actions: [],
      debug,
    };
  }
}