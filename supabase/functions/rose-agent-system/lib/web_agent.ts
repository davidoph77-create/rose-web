import { WebAgentOutput, WebSearchResult } from "./types.ts";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(message: string): string[] {
  const stopwords = new Set([
    "le", "la", "les", "un", "une", "des", "de", "du", "d", "et", "ou", "a",
    "à", "en", "sur", "pour", "avec", "que", "qui", "quoi", "quand", "dans",
    "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "notre",
    "votre", "leur", "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
    "rose", "systeme", "système", "ia", "moi",
  ]);

  return normalizeText(message)
    .split(" ")
    .filter((w) => w.length >= 3 && !stopwords.has(w))
    .slice(0, 8);
}

function shouldSearchWeb(message: string): { should: boolean; reason: string } {
  const text = normalizeText(message);

  if (
    /internet|web|cherche|recherche|google|trouve|actualite|actualités|news|nouveautes|nouveautés|dernieres|dernières|recent|récent|aujourd hui|aujourd'hui/.test(
      text,
    )
  ) {
    return {
      should: true,
      reason: "L'utilisateur demande explicitement une recherche web ou de l'information récente.",
    };
  }

  if (
    /comparer|comparatif|concurrents|concurrent|benchmark|tendance|tendances|marche|marché|etat de l art|etat de l'art|state of the art/.test(
      text,
    )
  ) {
    return {
      should: true,
      reason: "La demande suggère une comparaison, une veille ou une recherche de tendances.",
    };
  }

  if (
    /meilleure solution|meilleur outil|meilleure ia|quelle ia|quel outil|quel framework|quel sdk|quelle techno/.test(
      text,
    )
  ) {
    return {
      should: true,
      reason: "La demande nécessite probablement une comparaison d'outils ou de technologies existantes.",
    };
  }

  return {
    should: false,
    reason: "Aucune recherche web prioritaire détectée.",
  };
}

function buildSearchQuery(message: string): string {
  const text = normalizeText(message);
  const keywords = extractKeywords(message);

  if (keywords.length === 0) {
    return text.slice(0, 120);
  }

  if (/architecture|agent|memoire|mémoire|autonomie|planner|execution/.test(text)) {
    return `${keywords.join(" ")} architecture agents IA mémoire autonomie`;
  }

  if (/mobile|android|apk|react native|expo/.test(text)) {
    return `${keywords.join(" ")} react native expo android apk`;
  }

  if (/supabase|edge function|functions/.test(text)) {
    return `${keywords.join(" ")} supabase edge functions`;
  }

  return keywords.join(" ");
}

function buildFallbackResults(query: string): WebSearchResult[] {
  return [
    {
      title: "Recherche préparée",
      snippet: `Requête suggérée : ${query}`,
      url: "",
    },
  ];
}

export async function runWebAgent(message: string): Promise<WebAgentOutput> {
  const decision = shouldSearchWeb(message);
  const query = decision.should ? buildSearchQuery(message) : "";

  return {
    should_search: decision.should,
    query,
    reason: decision.reason,
    results: decision.should ? buildFallbackResults(query) : [],
  };
}