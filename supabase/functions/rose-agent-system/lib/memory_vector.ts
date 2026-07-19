import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type VectorMemoryResult = {
  id?: string;
  content: string;
  score: number;
  category?: string;
  importance?: number;
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

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((t) => t.length >= 3);
}

function jaccardScore(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);

  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;

  if (union === 0) return 0;
  return intersection / union;
}

export async function searchRelevantVectorMemories(
  user_id: string,
  query: string,
  limit = 5,
): Promise<VectorMemoryResult[]> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("rose_memories")
      .select("id, content, category, importance")
      .eq("user_id", user_id)
      .order("importance", { ascending: false })
      .limit(100);

    if (error) {
      console.error("searchRelevantVectorMemories error:", error.message);
      return [];
    }

    const queryTokens = tokenize(query);

    const scored = (data || []).map((row) => {
      const contentTokens = tokenize(row.content);
      let score = jaccardScore(queryTokens, contentTokens);

      if (row.category === "project" && normalizeText(query).includes("projet")) {
        score += 0.2;
      }

      score += Math.min((row.importance || 0) / 100, 0.1);

      return {
        id: row.id,
        content: row.content,
        category: row.category,
        importance: row.importance,
        score,
      };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error("searchRelevantVectorMemories exception:", error);
    return [];
  }
}