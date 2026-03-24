import { Intent } from "./types.ts";
import { truncate } from "./utils.ts";

export type PlanStep = {
  title: string;
  description: string;
  priority: number;
};

export type AutonomousPlan = {
  goal: string;
  strategy: string;
  steps: PlanStep[];
};

export function buildAutonomousPlan(params: {
  intent: Intent;
  message: string;
}): AutonomousPlan {
  const msg = truncate(params.message, 300);

  switch (params.intent) {
    case "project":
      return {
        goal: "Faire avancer le projet utilisateur",
        strategy: "Analyser le besoin, structurer l’architecture, proposer les prochaines étapes concrètes.",
        steps: [
          {
            title: "Clarifier le besoin",
            description: `Identifier précisément ce que l'utilisateur veut faire : ${msg}`,
            priority: 90,
          },
          {
            title: "Structurer la solution",
            description: "Proposer une architecture ou une organisation claire.",
            priority: 85,
          },
          {
            title: "Définir la prochaine action",
            description: "Donner l’étape la plus utile à exécuter maintenant.",
            priority: 80,
          },
        ],
      };

    case "task":
      return {
        goal: "Transformer la demande en actions concrètes",
        strategy: "Extraire les tâches, les ordonner et proposer un enchaînement simple.",
        steps: [
          {
            title: "Extraire la tâche",
            description: `Identifier la tâche à partir de : ${msg}`,
            priority: 90,
          },
          {
            title: "Découper en sous-étapes",
            description: "Découper la tâche en étapes courtes et réalisables.",
            priority: 80,
          },
          {
            title: "Prioriser",
            description: "Déterminer l’ordre le plus logique d’exécution.",
            priority: 75,
          },
        ],
      };

    case "search":
      return {
        goal: "Préparer une recherche utile",
        strategy: "Comprendre l’information recherchée, formuler une requête claire, cadrer le résultat attendu.",
        steps: [
          {
            title: "Comprendre la recherche",
            description: `Identifier précisément le sujet à rechercher : ${msg}`,
            priority: 90,
          },
          {
            title: "Formuler la requête",
            description: "Construire une requête web ou documentaire propre.",
            priority: 80,
          },
          {
            title: "Synthétiser l’objectif",
            description: "Définir ce que la réponse finale doit apporter à l’utilisateur.",
            priority: 70,
          },
        ],
      };

    case "self_improvement":
      return {
        goal: "Faire évoluer Rose",
        strategy: "Identifier les points faibles, proposer des améliorations ciblées, définir un plan d’implémentation.",
        steps: [
          {
            title: "Identifier l’amélioration",
            description: `Déterminer ce qui doit être amélioré : ${msg}`,
            priority: 95,
          },
          {
            title: "Choisir l’architecture",
            description: "Proposer la meilleure évolution technique ou fonctionnelle.",
            priority: 85,
          },
          {
            title: "Planifier l’implémentation",
            description: "Donner un ordre clair de mise en place.",
            priority: 80,
          },
        ],
      };

    default:
      return {
        goal: "Répondre utilement à la demande",
        strategy: "Comprendre le besoin, organiser la réponse, proposer la meilleure action suivante.",
        steps: [
          {
            title: "Analyser la demande",
            description: `Comprendre la demande : ${msg}`,
            priority: 85,
          },
          {
            title: "Répondre clairement",
            description: "Formuler une réponse utile, naturelle et structurée.",
            priority: 80,
          },
        ],
      };
  }
}