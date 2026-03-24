import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  ConversationSummary,
  Intent,
  MemoryItem,
} from "./types.ts";
import { nowISO, normalizeText, truncate } from "./utils.ts";

function getSupabase() {
  const url = Deno.env.get("ROSE_SUPABASE_URL") ?? "";
  const key = Deno.env.get("ROSE_SUPABASE_SERVICE_ROLE_KEY") ?? "";

  return {
    supabase: createClient(url, key),
    debug: {
      rose_supabase_url_loaded: !!url,
      rose_supabase_service_role_key_loaded: !!key,
    },
  };
}

export function shouldSaveMemory(message: string, intent: Intent): boolean {
  const raw = message.trim();
  const text = normalizeText(raw);

  // Ne pas sauvegarder les questions
  if (raw.includes("?")) return false;
  if (/^(que|quoi|quel|quelle|quels|quelles|comment|pourquoi|ou|quand)\b/.test(text)) {
    return false;
  }

  if (intent === "memory") return true;

  return /mon nom est|je m appelle|j aime|je prefere|important|n oublie pas|souviens toi|mon objectif|mon projet|priorite|je veux que rose/.test(
    text,
  );
}

export function inferMemoryCategory(message: string, intent: Intent): string {
  const text = normalizeText(message);

  if (intent === "project") return "project";
  if (intent === "goal_tracking") return "goal";
  if (/j aime|je prefere|preference/.test(text)) return "preference";
  if (/nom|je m appelle/.test(text)) return "identity";
  if (/rendez vous|agenda|planning|date/.test(text)) return "schedule";
  if (/rose|assistant|ia|application|code|projet/.test(text)) return "project";

  return "general";
}

export function memoryImportance(message: string, intent: Intent): number {
  const text = normalizeText(message);

  let score = 5;
  if (intent === "memory") score += 2;
  if (intent === "project") score += 2;
  if (intent === "goal_tracking") score += 2;
  if (/important|essentiel|priorite|n oublie jamais|souviens toi/.test(text)) score += 2;
  if (/mon projet|mon objectif|je veux que rose/.test(text)) score += 1;

  return Math.max(1, Math.min(score, 10));
}

function simplifyMemoryContent(message: string): string {
  const text = normalizeText(message);

  return truncate(
    text
      .replace(/^rose\s+/i, "")
      .replace(/^souviens toi que\s+/i, "")
      .replace(/^souviens toi\s+que\s+/i, "")
      .replace(/^souviens toi\s+/i, "")
      .trim(),
    1000,
  );
}

function areMemoriesVerySimilar(a: string, b: string): boolean {
  const aa = simplifyMemoryContent(a);
  const bb = simplifyMemoryContent(b);

  if (aa === bb) return true;
  if (aa.includes(bb) || bb.includes(aa)) return true;

  return false;
}

async function findExistingSimilarMemory(
  user_id: string,
  message: string,
): Promise<MemoryItem | null> {
  try {
    const { supabase } = getSupabase();

    const { data, error } = await supabase
      .from("rose_memories")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Erreur findExistingSimilarMemory:", error.message);
      return null;
    }

    const existing = (data ?? []).find((item) =>
      areMemoriesVerySimilar(item.content, message)
    );

    return existing ?? null;
  } catch (error) {
    console.error("Exception findExistingSimilarMemory:", error);
    return null;
  }
}

export async function saveMemory(
  user_id: string,
  message: string,
  intent: Intent,
): Promise<{ ok: boolean; error?: string; debug?: Record<string, unknown> }> {
  try {
    const { supabase, debug } = getSupabase();

    const cleanedContent = simplifyMemoryContent(message);
    const category = inferMemoryCategory(message, intent);
    const importance = memoryImportance(message, intent);

    const existing = await findExistingSimilarMemory(user_id, cleanedContent);

    if (existing?.id) {
      const { error } = await supabase
        .from("rose_memories")
        .update({
          content: cleanedContent,
          category,
          importance: Math.max(existing.importance ?? 1, importance),
          created_at: nowISO(),
        })
        .eq("id", existing.id);

      if (error) {
        return {
          ok: false,
          error: error.message,
          debug: {
            ...debug,
            mode: "update_existing_memory",
            existing_memory_id: existing.id,
          },
        };
      }

      return {
        ok: true,
        debug: {
          ...debug,
          mode: "update_existing_memory",
          existing_memory_id: existing.id,
        },
      };
    }

    const payload: MemoryItem = {
      user_id,
      content: cleanedContent,
      category,
      importance,
      created_at: nowISO(),
    };

    const { error } = await supabase.from("rose_memories").insert(payload);

    if (error) {
      return {
        ok: false,
        error: error.message,
        debug: {
          ...debug,
          mode: "insert_new_memory",
        },
      };
    }

    return {
      ok: true,
      debug: {
        ...debug,
        mode: "insert_new_memory",
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function fetchRelevantMemories(
  user_id: string,
  limit = 10,
): Promise<MemoryItem[]> {
  try {
    const { supabase } = getSupabase();

    const { data, error } = await supabase
      .from("rose_memories")
      .select("*")
      .eq("user_id", user_id)
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Erreur fetchRelevantMemories:", error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Exception fetchRelevantMemories:", error);
    return [];
  }
}

export async function fetchTargetedMemories(
  user_id: string,
  query: string,
  limit = 5,
): Promise<MemoryItem[]> {
  try {
    const normalizedQuery = normalizeText(query);
    const { supabase } = getSupabase();

    const { data, error } = await supabase
      .from("rose_memories")
      .select("*")
      .eq("user_id", user_id)
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error("Erreur fetchTargetedMemories:", error.message);
      return [];
    }

    const scored = (data ?? []).map((item) => {
      const content = normalizeText(item.content);
      const category = normalizeText(item.category ?? "");
      let score = item.importance ?? 1;

      if (normalizedQuery.includes("projet") && category === "project") score += 5;
      if (normalizedQuery.includes("objectif") && category === "goal") score += 5;
      if (normalizedQuery.includes("prefere") && category === "preference") score += 5;
      if (normalizedQuery.includes("nom") && category === "identity") score += 5;

      const queryWords = normalizedQuery.split(" ").filter(Boolean);
      for (const word of queryWords) {
        if (word.length < 3) continue;
        if (content.includes(word)) score += 2;
      }

      return { item, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.item);
  } catch (error) {
    console.error("Exception fetchTargetedMemories:", error);
    return [];
  }
}

export async function saveConversation(params: {
  user_id: string;
  conversation_id: string | null;
  user_message: string;
  assistant_reply: string;
  mood: string;
  mood_score: number;
  intent: string;
  summary: ConversationSummary;
}) {
  try {
    const { supabase } = getSupabase();

    const { error } = await supabase.from("rose_conversations").insert({
      user_id: params.user_id,
      conversation_id: params.conversation_id,
      user_message: params.user_message,
      assistant_reply: params.assistant_reply,
      mood: params.mood,
      mood_score: params.mood_score,
      intent: params.intent,
      summary_short: params.summary.short_summary,
      summary_key_points: params.summary.key_points,
      summary_user_needs: params.summary.user_needs,
      created_at: nowISO(),
    });

    if (error) {
      console.error("Erreur saveConversation:", error.message);
    }
  } catch (error) {
    console.error("Exception saveConversation:", error);
  }
}