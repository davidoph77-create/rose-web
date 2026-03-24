import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeText, nowISO } from "./utils.ts";

export type UserProfile = {
  user_id: string;
  display_name?: string | null;
  main_project?: string | null;
  priorities?: string[] | null;
  preferences?: string[] | null;
  updated_at?: string | null;
};

function getSupabase() {
  const url = Deno.env.get("ROSE_SUPABASE_URL") ?? "";
  const key = Deno.env.get("ROSE_SUPABASE_SERVICE_ROLE_KEY") ?? "";

  return createClient(url, key);
}

export async function getUserProfile(user_id: string): Promise<UserProfile | null> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("rose_profiles")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      console.error("Erreur getUserProfile:", error.message);
      return null;
    }

    return data ?? null;
  } catch (error) {
    console.error("Exception getUserProfile:", error);
    return null;
  }
}

export function inferProfilePatchFromMessage(message: string): Partial<UserProfile> {
  const text = normalizeText(message);
  const patch: Partial<UserProfile> = {};

  const projectMatch =
    text.match(/mon projet principal s appelle\s+(.+)/) ||
    text.match(/mon projet s appelle\s+(.+)/);

  if (projectMatch?.[1]) {
    patch.main_project = projectMatch[1].trim();
  }

  const nameMatch =
    text.match(/je m appelle\s+(.+)/) ||
    text.match(/mon nom est\s+(.+)/);

  if (nameMatch?.[1]) {
    patch.display_name = nameMatch[1].trim();
  }

  if (/priorite|priorites/.test(text)) {
    patch.priorities = [message.trim()];
  }

  if (/je prefere|j aime/.test(text)) {
    patch.preferences = [message.trim()];
  }

  return patch;
}

export async function upsertUserProfile(
  user_id: string,
  patch: Partial<UserProfile>,
): Promise<boolean> {
  try {
    const supabase = getSupabase();

    const current = await getUserProfile(user_id);

    const next: UserProfile = {
      user_id,
      display_name: patch.display_name ?? current?.display_name ?? null,
      main_project: patch.main_project ?? current?.main_project ?? null,
      priorities: mergeUnique(current?.priorities, patch.priorities),
      preferences: mergeUnique(current?.preferences, patch.preferences),
      updated_at: nowISO(),
    };

    const { error } = await supabase.from("rose_profiles").upsert(next, {
      onConflict: "user_id",
    });

    if (error) {
      console.error("Erreur upsertUserProfile:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception upsertUserProfile:", error);
    return false;
  }
}

function mergeUnique(
  a?: string[] | null,
  b?: string[] | null,
): string[] {
  return [...new Set([...(a ?? []), ...(b ?? [])])];
}