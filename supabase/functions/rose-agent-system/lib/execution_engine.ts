// supabase/functions/rose-agent-system/lib/execution_engine.ts

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type ExecutionInput = {
  supabase: SupabaseClient;
  user_id: string;
  next_action?: string | null;
  goal?: any;
  roadmap?: any;
};

type ExecutionDebug = {
  can_execute: boolean;
  selected_action: string | null;
  execution_mode: string | null;
  inserted_task: any;
  updated_goal: any;
  exception: string | null;
};

export async function runExecutionEngine(input: ExecutionInput) {
  const debug: ExecutionDebug = {
    can_execute: false,
    selected_action: null,
    execution_mode: null,
    inserted_task: null,
    updated_goal: null,
    exception: null,
  };

  try {
    const safeUserId = String(input?.user_id ?? "").trim();
    const nextAction = String(input?.next_action ?? "").trim();
    const goal = input?.goal ?? null;
    const roadmap = input?.roadmap ?? null;

    if (!safeUserId || !nextAction) {
      return {
        execution_triggered: false,
        execution_result: null,
        debug,
      };
    }

    debug.can_execute = true;
    debug.selected_action = nextAction;

    const lower = nextAction.toLowerCase();

    // Mode 1 : créer une tâche d’exécution prioritaire
    if (
      lower.includes("creer") ||
      lower.includes("mettre a jour") ||
      lower.includes("créer") ||
      lower.includes("roadmap") ||
      lower.includes("tache") ||
      lower.includes("tâche") ||
      lower.includes("action")
    ) {
      debug.execution_mode = "create_execution_task";

      const { data: insertedTask, error: taskError } = await input.supabase
        .from("rose_tasks")
        .insert({
          user_id: safeUserId,
          scope: "execution_task",
          goal_id: goal?.id ?? null,
          roadmap_id: roadmap?.id ?? null,
          title: nextAction,
          content: "Tâche créée automatiquement par Rose V4 Auto-Execution.",
          priority: 95,
          status: "pending",
          due_date: null,
        })
        .select()
        .single();

      if (taskError) {
        debug.exception = taskError.message;
        return {
          execution_triggered: false,
          execution_result: null,
          debug,
        };
      }

      debug.inserted_task = insertedTask;

      return {
        execution_triggered: true,
        execution_result: {
          type: "task_created",
          task: insertedTask,
        },
        debug,
      };
    }

    // Mode 2 : mettre à jour le progrès du goal si présent
    if (goal?.id) {
      debug.execution_mode = "update_goal_progress";

      const currentProgress =
        typeof goal?.progress === "number" ? goal.progress : 0;

      const newProgress = Math.min(100, currentProgress + 10);

      const { data: updatedGoal, error: goalError } = await input.supabase
        .from("rose_goals")
        .update({
          progress: newProgress,
          status: newProgress >= 100 ? "done" : "active",
        })
        .eq("id", goal.id)
        .select()
        .single();

      if (goalError) {
        debug.exception = goalError.message;
        return {
          execution_triggered: false,
          execution_result: null,
          debug,
        };
      }

      debug.updated_goal = updatedGoal;

      return {
        execution_triggered: true,
        execution_result: {
          type: "goal_progress_updated",
          goal: updatedGoal,
        },
        debug,
      };
    }

    return {
      execution_triggered: false,
      execution_result: null,
      debug,
    };
  } catch (err: any) {
    debug.exception = err?.message ?? String(err);

    return {
      execution_triggered: false,
      execution_result: null,
      debug,
    };
  }
}