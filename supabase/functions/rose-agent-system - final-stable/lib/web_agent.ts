import { truncate } from "./utils.ts";

export type WebSearchResult = {
  title: string;
  snippet: string;
  url: string;
};

export type WebAgentOutput = {
  should_search: boolean;
  query: string;
  reason: string;
  results: WebSearchResult[];
};

function normalizeSearchQuery(message: string): string {
  return truncate(
    message
      .replace(/^rose\s+/i, "")
      .replace(/^cherche\s+/i, "")
      .replace(/^recherche\s+/i, "")
      .replace(/^trouve\s+/i, "")
      .replace(/^cherche moi\s+/i, "")
      .replace(/^cherche sur internet\s+/i, "")
      .trim(),
    300,
  );
}

export async function runWebAgent(
  message: string,
): Promise<WebAgentOutput> {

  const text = message.toLowerCase();

  const should_search =
    /cherche|recherche|internet|web|google|trouve moi|infos|information|actualites|news/.test(
      text,
    );

  if (!should_search) {
    return {
      should_search: false,
      query: "",
      reason: "Aucune recherche web explicite détectée.",
      results: [],
    };
  }

  const query = normalizeSearchQuery(message);

  return {
    should_search: true,
    query,
    reason: "L'utilisateur demande une recherche web ou des informations externes.",
    results: [],
  };
}