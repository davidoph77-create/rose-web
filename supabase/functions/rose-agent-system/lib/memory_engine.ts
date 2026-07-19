import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function runMemoryEngine(
  supabase: SupabaseClient,
  user_id: string,
  message: string
) {
  const debug: Record<string, unknown> = {
    should_save: true,
    detected_scope: "project",
    insert_error: null,
    context_rows_count: 0,
  };

  try {
    const safeMessage = String(message ?? "").trim();

    const summary =
      safeMessage.length > 180
        ? safeMessage.slice(0, 180) + "..."
        : safeMessage;

    const tags = ["objectif", "roadmap", "rose"];

    const { error: insertError } = await supabase.from("rose_memory").insert({
      user_id,
      scope: "project",
      role: "user",
      content: safeMessage,
      summary,
      tags,
      importance: 0.8,
      source: "chat",
    });

    if (insertError) {
      debug.insert_error = insertError.message;
    }

    const { data: contextRows, error: contextError } = await supabase
      .from("rose_memory")
      .select("*")
      .eq("user_id", user_id)
      .order("id", { ascending: false })
      .limit(6);

    if (contextError) {
      debug.context_error = contextError.message;
    }

    debug.context_rows_count = contextRows?.length ?? 0;

    return {
      memory_saved: !insertError,
      context_rows: contextRows ?? [],
      debug,
    };
  } catch (err) {
    debug.exception = err instanceof Error ? err.message : String(err);

    return {
      memory_saved: false,
      context_rows: [],
      debug,
    };
  }
}