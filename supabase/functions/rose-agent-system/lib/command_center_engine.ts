// supabase/functions/rose-agent-system/lib/command_center_engine.ts

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type CommandCenterInput = {
  supabase: SupabaseClient;
  user_id: string;
  goal?: any;
  roadmap?: any;
  dashboard?: any;
  next_action?: string | null;
};

export async function runCommandCenterEngine(input: CommandCenterInput) {
  const debug: any = {
    mission_mode: false,
    queue_built: false,
    queue_count: 0,
    exception: null,
  };

  try {
    const supabase = input.supabase;
    const user_id = String(input?.user_id ?? "").trim();

    if (!user_id) {
      return {
        command_center_enabled: false,
        mission_mode: false,
        mission_queue: [],
        mission_status: "idle",
        command_center_debug: debug,
      };
    }

    debug.mission_mode = true;

    const { data: tasks, error } = await supabase
      .from("rose_tasks")
      .select("*")
      .eq("user_id", user_id)
      .order("priority", { ascending: false });

    if (error) {
      debug.exception = error.message;
      return {
        command_center_enabled: false,
        mission_mode: true,
        mission_queue: [],
        mission_status: "error",
        command_center_debug: debug,
      };
    }

    const safeTasks = Array.isArray(tasks) ? tasks : [];

    const missionQueue = safeTasks
      .filter((t) => String(t?.status ?? "").toLowerCase() === "pending")
      .slice(0, 10)
      .map((t, index) => ({
        order: index + 1,
        id: t?.id ?? null,
        title: t?.title ?? "",
        scope: t?.scope ?? null,
        priority: Number(t?.priority ?? 0),
        status: t?.status ?? null,
      }));

    debug.queue_built = true;
    debug.queue_count = missionQueue.length;

    let missionStatus = "ready";
    if (missionQueue.length === 0) {
      missionStatus = "waiting_for_tasks";
    } else if (missionQueue.length >= 5) {
      missionStatus = "active";
    }

    return {
      command_center_enabled: true,
      mission_mode: true,
      mission_queue: missionQueue,
      mission_status: missionStatus,
      current_focus:
        missionQueue.length > 0 ? missionQueue[0].title : input?.next_action ?? null,
      command_center_debug: debug,
    };
  } catch (err: any) {
    debug.exception = err?.message ?? String(err);

    return {
      command_center_enabled: false,
      mission_mode: false,
      mission_queue: [],
      mission_status: "crash",
      current_focus: null,
      command_center_debug: debug,
    };
  }
}