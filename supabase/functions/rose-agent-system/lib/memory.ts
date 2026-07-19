import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

export async function getMemory(userId: string) {
  const { data } = await supabase
    .from("rose_memory")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
}

async function saveMemory(userId: string, content: string) {
  if (!content || content.length < 15) return;

  await supabase.from("rose_memory").insert({
    user_id: userId,
    content,
    summary: content.slice(0, 120),
    role: "assistant",
    scope: "conversation",
    importance: 0.7,
  });
}

async function saveGoal(userId: string, goal: string) {
  if (!goal) return;

  await supabase.from("rose_goals").insert({
    user_id: userId,
    title: goal,
    status: "active",
    scope: "personal",
    priority: 0.8,
  });
}

async function saveTask(userId: string, task: string) {
  if (!task) return;

  await supabase.from("rose_tasks").insert({
    user_id: userId,
    title: task,
    status: "todo",
    scope: "execution",
    priority: 0.7,
  });
}

export async function processAutonomy(userId: string, result: any) {
  try {
    // 🧠 mémoire
    if (result.should_save_memory && result.reply) {
      await saveMemory(userId, result.reply);
    }

    // 🎯 objectif
    if (result.goal) {
      await saveGoal(userId, result.goal);
    }

    // 📋 tâche principale
    if (result.task) {
      await saveTask(userId, result.task);
    }

    // ⚡ prochaine action = tâche automatique
    if (result.next_action) {
      await saveTask(userId, "⚡ " + result.next_action);
    }

    // 💡 suggestion = mémoire
    if (result.autonomous_suggestion) {
      await saveMemory(userId, result.autonomous_suggestion);
    }

    // 📅 plan → découpage en tâches
    if (result.plan) {
      const steps = result.plan.split("\n");
      for (const step of steps) {
        const clean = step.replace(/^\d+\.\s*/, "").trim();
        if (clean.length > 5) {
          await saveTask(userId, clean);
        }
      }
    }
  } catch (e) {
    console.log("AUTO TASK/MEMORY ERROR =", e);
  }
}