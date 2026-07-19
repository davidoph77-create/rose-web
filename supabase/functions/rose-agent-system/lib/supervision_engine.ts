// supabase/functions/rose-agent-system/lib/supervision_engine.ts

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type SupervisionInput = {
  supabase: SupabaseClient;
  user_id: string;
  goal?: any;
  roadmap?: any;
  memory_context?: any[];
};

type SupervisionDebug = {
  goal_found: boolean;
  roadmap_found: boolean;
  task_count: number;
  pending_task_count: number;
  done_task_count: number;
  execution_task_count: number;
  memory_context_count: number;
  health_score_breakdown: {
    goal_score: number;
    roadmap_score: number;
    task_score: number;
    memory_score: number;
    progress_score: number;
  };
  exception: string | null;
};

export async function runSupervisionEngine(input: SupervisionInput) {
  const debug: SupervisionDebug = {
    goal_found: false,
    roadmap_found: false,
    task_count: 0,
    pending_task_count: 0,
    done_task_count: 0,
    execution_task_count: 0,
    memory_context_count: Array.isArray(input?.memory_context)
      ? input.memory_context.length
      : 0,
    health_score_breakdown: {
      goal_score: 0,
      roadmap_score: 0,
      task_score: 0,
      memory_score: 0,
      progress_score: 0,
    },
    exception: null,
  };

  try {
    const supabase = input.supabase;
    const user_id = String(input?.user_id ?? "").trim();
    const goal = input?.goal ?? null;
    const roadmap = input?.roadmap ?? null;
    const memoryContext = Array.isArray(input?.memory_context)
      ? input.memory_context
      : [];

    if (!user_id) {
      return {
        supervision_enabled: false,
        dashboard: null,
        debug,
      };
    }

    debug.goal_found = !!goal;
    debug.roadmap_found = !!roadmap;

    const { data: tasks, error: tasksError } = await supabase
      .from("rose_tasks")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (tasksError) {
      debug.exception = tasksError.message;
      return {
        supervision_enabled: false,
        dashboard: null,
        debug,
      };
    }

    const safeTasks = Array.isArray(tasks) ? tasks : [];

    const pendingTasks = safeTasks.filter(
      (t) => String(t?.status ?? "").toLowerCase() === "pending",
    );
    const doneTasks = safeTasks.filter(
      (t) => String(t?.status ?? "").toLowerCase() === "done",
    );
    const executionTasks = safeTasks.filter(
      (t) => String(t?.scope ?? "").toLowerCase() === "execution_task",
    );

    debug.task_count = safeTasks.length;
    debug.pending_task_count = pendingTasks.length;
    debug.done_task_count = doneTasks.length;
    debug.execution_task_count = executionTasks.length;

    const goalScore = goal ? 20 : 0;
    const roadmapScore = roadmap ? 20 : 0;
    const taskScore = Math.min(25, safeTasks.length * 3);
    const memoryScore = Math.min(15, memoryContext.length * 2);

    let progressValue = 0;
    if (goal && typeof goal?.progress === "number") {
      progressValue = goal.progress;
    }

    const progressScore = Math.min(20, Math.floor(progressValue / 5));

    debug.health_score_breakdown = {
      goal_score: goalScore,
      roadmap_score: roadmapScore,
      task_score: taskScore,
      memory_score: memoryScore,
      progress_score: progressScore,
    };

    const healthScore =
      goalScore + roadmapScore + taskScore + memoryScore + progressScore;

    let systemStatus = "fragile";
    if (healthScore >= 75) systemStatus = "excellent";
    else if (healthScore >= 55) systemStatus = "stable";
    else if (healthScore >= 35) systemStatus = "moyen";

    const topPriorities = pendingTasks
      .sort((a, b) => Number(b?.priority ?? 0) - Number(a?.priority ?? 0))
      .slice(0, 5)
      .map((task) => ({
        id: task?.id ?? null,
        title: task?.title ?? "",
        priority: Number(task?.priority ?? 0),
        status: task?.status ?? null,
        scope: task?.scope ?? null,
      }));

    const recentExecution = executionTasks.slice(0, 3).map((task) => ({
      id: task?.id ?? null,
      title: task?.title ?? "",
      created_at: task?.created_at ?? null,
      status: task?.status ?? null,
    }));

    const summaryLines: string[] = [];

    if (goal) {
      summaryLines.push("Un objectif principal est bien en place.");
    } else {
      summaryLines.push("Aucun objectif principal n'est encore défini.");
    }

    if (roadmap) {
      summaryLines.push("Une roadmap projet est disponible.");
    } else {
      summaryLines.push("Aucune roadmap projet n'est encore créée.");
    }

    summaryLines.push(
      `Le système contient actuellement ${safeTasks.length} tâche(s), dont ${pendingTasks.length} en attente et ${doneTasks.length} terminée(s).`,
    );

    if (memoryContext.length > 0) {
      summaryLines.push(
        `La mémoire utile contient ${memoryContext.length} élément(s) de contexte.`,
      );
    } else {
      summaryLines.push("La mémoire utile est encore faible.");
    }

    summaryLines.push(`État global estimé : ${systemStatus}.`);

    const dashboard = {
      health_score: healthScore,
      system_status: systemStatus,
      summary: summaryLines.join(" "),
      stats: {
        has_goal: !!goal,
        has_roadmap: !!roadmap,
        total_tasks: safeTasks.length,
        pending_tasks: pendingTasks.length,
        done_tasks: doneTasks.length,
        execution_tasks: executionTasks.length,
        memory_context_count: memoryContext.length,
        goal_progress: progressValue,
      },
      top_priorities: topPriorities,
      recent_execution: recentExecution,
      suggested_focus:
        topPriorities.length > 0
          ? `Priorité actuelle : ${topPriorities[0].title}`
          : "Créer de nouvelles tâches prioritaires.",
    };

    return {
      supervision_enabled: true,
      dashboard,
      debug,
    };
  } catch (err: any) {
    debug.exception = err?.message ?? String(err);

    return {
      supervision_enabled: false,
      dashboard: null,
      debug,
    };
  }
}