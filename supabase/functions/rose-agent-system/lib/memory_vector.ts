import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createEmbedding } from "./embeddings.ts";

function getSupabase() {
  const url = Deno.env.get("ROSE_SUPABASE_URL") ?? "";
  const key = Deno.env.get("ROSE_SUPABASE_SERVICE_ROLE_KEY") ?? "";

  return createClient(url, key);
}

export async function saveMemoryEmbedding(params: {
  memory_id: string;
  user_id: string;
  content: string;
}): Promise<boolean> {
  try {
    const supabase = getSupabase();

    const embedding = await createEmbedding(params.content);

    if (!embedding) {
      console.warn("Embedding non généré");
      return false;
    }

    const { error } = await supabase
      .from("rose_memory_vectors")
      .upsert({
        memory_id: params.memory_id,
        user_id: params.user_id,
        content: params.content,
        embedding,
      }, {
        onConflict: "memory_id",
      });

    if (error) {
      console.error("Erreur saveMemoryEmbedding:", error.message);
      return false;
    }

    return true;

  } catch (error) {
    console.error("Exception saveMemoryEmbedding:", error);
    return false;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  const length = Math.min(a.length, b.length);

  for (let i = 0; i < length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchRelevantVectorMemories(
  user_id: string,
  query: string,
  limit = 5,
): Promise<Array<{ content: string; score: number }>> {

  try {
    const supabase = getSupabase();

    const queryEmbedding = await createEmbedding(query);

    if (!queryEmbedding) {
      console.warn("Embedding de requête non généré");
      return [];
    }

    const { data, error } = await supabase
      .from("rose_memory_vectors")
      .select("content, embedding")
      .eq("user_id", user_id)
      .limit(50);

    if (error) {
      console.error("Erreur searchRelevantVectorMemories:", error.message);
      return [];
    }

    const results = (data ?? [])
      .filter((item) => Array.isArray(item.embedding))
      .map((item) => ({
        content: item.content as string,
        score: cosineSimilarity(queryEmbedding, item.embedding as number[]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;

  } catch (error) {
    console.error("Exception searchRelevantVectorMemories:", error);
    return [];
  }
}