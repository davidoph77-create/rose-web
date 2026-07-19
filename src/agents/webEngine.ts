import { generateId } from "../core/ids";

export type WebSearchCategory =
  | "materiaux"
  | "aides"
  | "batiment"
  | "entreprise"
  | "immobilier"
  | "rose"
  | "general";

export type WebSearchStatus =
  | "prepared"
  | "waiting_validation"
  | "done"
  | "cancelled";

export type WebSearchRequest = {
  id: string;
  query: string;
  category: WebSearchCategory;
  status: WebSearchStatus;
  reason: string;
  createdAt: string;
};

export function createWebSearchRequest(
  query: string,
  reason = "Recherche préparée par Rose."
): WebSearchRequest {
  const now = new Date().toISOString();

  return {
    id: generateId("web"),
    query,
    category: detectWebCategory(query),
    status: "waiting_validation",
    reason,
    createdAt: now,
  };
}

export function detectWebCategory(text: string): WebSearchCategory {
  const msg = text.toLowerCase();

  if (
    msg.includes("tuile") ||
    msg.includes("zinc") ||
    msg.includes("ardoise") ||
    msg.includes("bois") ||
    msg.includes("charpente") ||
    msg.includes("couverture") ||
    msg.includes("matériaux") ||
    msg.includes("materiaux")
  ) {
    return "materiaux";
  }

  if (
    msg.includes("aide") ||
    msg.includes("subvention") ||
    msg.includes("prime") ||
    msg.includes("maprimerénov") ||
    msg.includes("maprimerenov")
  ) {
    return "aides";
  }

  if (
    msg.includes("bâtiment") ||
    msg.includes("batiment") ||
    msg.includes("artisan") ||
    msg.includes("décennale") ||
    msg.includes("devis")
  ) {
    return "batiment";
  }

  if (
    msg.includes("entreprise") ||
    msg.includes("client") ||
    msg.includes("chantier") ||
    msg.includes("ca") ||
    msg.includes("chiffre d'affaires")
  ) {
    return "entreprise";
  }

  if (
    msg.includes("maison") ||
    msg.includes("prêt") ||
    msg.includes("credit") ||
    msg.includes("crédit") ||
    msg.includes("notaire") ||
    msg.includes("immobilier")
  ) {
    return "immobilier";
  }

  if (
    msg.includes("rose") ||
    msg.includes("ia") ||
    msg.includes("application") ||
    msg.includes("expo") ||
    msg.includes("supabase")
  ) {
    return "rose";
  }

  return "general";
}

export function suggestWebQueriesFromMemory(memories: string[]): WebSearchRequest[] {
  const requests: WebSearchRequest[] = [];

  memories.forEach((memory) => {
    const msg = memory.toLowerCase();

    if (
      msg.includes("tuile") ||
      msg.includes("zinc") ||
      msg.includes("couverture") ||
      msg.includes("charpente")
    ) {
      requests.push(
        createWebSearchRequest(
          "prix matériaux couverture charpente France",
          "Rose a détecté une information liée aux matériaux."
        )
      );
    }

    if (
      msg.includes("aide") ||
      msg.includes("subvention") ||
      msg.includes("rénovation") ||
      msg.includes("renovation")
    ) {
      requests.push(
        createWebSearchRequest(
          "aides rénovation toiture artisan France",
          "Rose a détecté une demande liée aux aides."
        )
      );
    }

    if (
      msg.includes("maison") ||
      msg.includes("prêt") ||
      msg.includes("crédit") ||
      msg.includes("notaire")
    ) {
      requests.push(
        createWebSearchRequest(
          "solutions financement immobilier apport personnel France",
          "Rose a détecté une information liée au projet immobilier."
        )
      );
    }

    if (
      msg.includes("entreprise") ||
      msg.includes("client") ||
      msg.includes("chantier")
    ) {
      requests.push(
        createWebSearchRequest(
          "développer activité artisan couverture charpente",
          "Rose a détecté une information liée à l’entreprise."
        )
      );
    }
  });

  return removeDuplicateWebRequests(requests);
}

export function removeDuplicateWebRequests(
  requests: WebSearchRequest[]
): WebSearchRequest[] {
  const seen = new Set<string>();

  return requests.filter((request) => {
    const key = request.query.toLowerCase().trim();

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

export function updateWebRequestStatus(
  requests: WebSearchRequest[],
  requestId: string,
  status: WebSearchStatus
): WebSearchRequest[] {
  return requests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status,
        }
      : request
  );
}

export function deleteWebRequest(
  requests: WebSearchRequest[],
  requestId: string
): WebSearchRequest[] {
  return requests.filter((request) => request.id !== requestId);
}