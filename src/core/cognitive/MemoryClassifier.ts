import {
  MemoryCategory,
} from "./types";

type ClassificationResult = {
  category: MemoryCategory;
  confidence: number;
  tags: string[];
};

const CATEGORY_RULES: Array<{
  category: MemoryCategory;
  keywords: string[];
}> = [
  {
    category: "project",
    keywords: [
      "rose",
      "application",
      "version",
      "v8",
      "développement",
      "code",
      "projet",
    ],
  },
  {
    category: "business",
    keywords: [
      "entreprise",
      "chantier",
      "client",
      "devis",
      "facture",
      "couverture",
      "charpente",
    ],
  },
  {
    category: "goal",
    keywords: [
      "objectif",
      "atteindre",
      "progression",
      "priorité",
    ],
  },
  {
    category: "task",
    keywords: [
      "tâche",
      "faire",
      "terminer",
      "mission",
      "action",
    ],
  },
  {
    category: "decision",
    keywords: [
      "décision",
      "choisir",
      "valider",
      "refuser",
      "accepter",
    ],
  },
  {
    category: "preference",
    keywords: [
      "j'aime",
      "je préfère",
      "préférence",
      "habitude",
    ],
  },
  {
    category: "event",
    keywords: [
      "rendez-vous",
      "agenda",
      "date",
      "demain",
      "aujourd'hui",
      "rappel",
    ],
  },
  {
    category: "identity",
    keywords: [
      "je suis",
      "mon nom",
      "je m'appelle",
      "métier",
      "profession",
    ],
  },
];

export class MemoryClassifier {
  classify(content: string): ClassificationResult {
    const normalized = content.toLowerCase();

    let bestCategory: MemoryCategory = "other";
    let bestScore = 0;
    let bestTags: string[] = [];

    for (const rule of CATEGORY_RULES) {
      const matches = rule.keywords.filter((keyword) =>
        normalized.includes(keyword)
      );

      if (matches.length > bestScore) {
        bestScore = matches.length;
        bestCategory = rule.category;
        bestTags = matches;
      }
    }

    return {
      category: bestCategory,
      confidence:
        bestScore === 0
          ? 0.4
          : Math.min(0.55 + bestScore * 0.12, 0.95),
      tags: bestTags,
    };
  }
}
