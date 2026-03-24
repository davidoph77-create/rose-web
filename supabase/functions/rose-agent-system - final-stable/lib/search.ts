import { truncate } from "./utils.ts";

export type SearchPlan = {
  should_search: boolean;
  queries: string[];
  reason: string;
};

export function buildSearchPlan(message: string): SearchPlan {
  const text = message.toLowerCase();

  const wantsSearch =
    /cherche|recherche|internet|web|google|trouve moi|infos|information/.test(text);

  if (!wantsSearch) {
    return {
      should_search: false,
      queries: [],
      reason: "Pas de recherche web explicite demandée.",
    };
  }

  const cleaned = truncate(message, 250);

  return {
    should_search: true,
    queries: [
      cleaned,
      `Informations à jour sur: ${cleaned}`,
    ],
    reason: "L'utilisateur demande une recherche externe ou des informations web.",
  };
}