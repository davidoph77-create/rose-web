import { generateId } from "../core/ids";

export type DecisionType =
  | "task"
  | "goal"
  | "web"
  | "business"
  | "memory"
  | "general";

export type DecisionPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type DecisionStatus =
  | "proposed"
  | "accepted"
  | "rejected";

export type RoseDecision = {
  id: string;
  title: string;
  explanation: string;
  recommendation: string;
  type: DecisionType;
  priority: DecisionPriority;
  status: DecisionStatus;
  createdAt: string;
};

export function createDecision(
  title: string,
  explanation: string,
  recommendation: string,
  type: DecisionType = "general",
  priority: DecisionPriority = "medium"
): RoseDecision {
  return {
    id: generateId("decision"),
    title,
    explanation,
    recommendation,
    type,
    priority,
    status: "proposed",
    createdAt: new Date().toISOString(),
  };
}

export function suggestDecisionsFromMemory(memories: string[]): RoseDecision[] {
  const decisions: RoseDecision[] = [];

  memories.forEach((memory) => {
    const msg = memory.toLowerCase();

    if (msg.includes("8000") || msg.includes("objectif")) {
      decisions.push(
        createDecision(
          "Prioriser l’objectif financier",
          "Rose a détecté un objectif financier important dans la mémoire.",
          "Suivre cet objectif chaque semaine et créer des actions concrètes.",
          "goal",
          "high"
        )
      );
    }

    if (msg.includes("chantier") || msg.includes("client") || msg.includes("entreprise")) {
      decisions.push(
        createDecision(
          "Analyser l’activité entreprise",
          "Rose a détecté des informations liées aux chantiers, clients ou à l’entreprise.",
          "Créer un suivi régulier de l’activité et des opportunités.",
          "business",
          "high"
        )
      );
    }

    if (msg.includes("web") || msg.includes("internet") || msg.includes("prix") || msg.includes("matériaux")) {
      decisions.push(
        createDecision(
          "Préparer une recherche Web",
          "Rose a détecté une information qui peut nécessiter une recherche externe.",
          "Préparer une recherche Web, puis attendre la validation de David.",
          "web",
          "medium"
        )
      );
    }

    if (msg.includes("rose") || msg.includes("ia") || msg.includes("autonome")) {
      decisions.push(
        createDecision(
          "Faire évoluer Rose IA",
          "Rose a détecté une demande liée à son évolution.",
          "Continuer l’évolution par moteurs séparés et versions stables.",
          "memory",
          "medium"
        )
      );
    }
  });

  return removeDuplicateDecisions(decisions);
}

export function removeDuplicateDecisions(
  decisions: RoseDecision[]
): RoseDecision[] {
  const seen = new Set<string>();

  return decisions.filter((decision) => {
    const key = decision.title.toLowerCase().trim();

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

export function updateDecisionStatus(
  decisions: RoseDecision[],
  decisionId: string,
  status: DecisionStatus
): RoseDecision[] {
  return decisions.map((decision) =>
    decision.id === decisionId
      ? {
          ...decision,
          status,
        }
      : decision
  );
}

export function deleteDecision(
  decisions: RoseDecision[],
  decisionId: string
): RoseDecision[] {
  return decisions.filter((decision) => decision.id !== decisionId);
}