import {
  CreatePlanInput,
  PlannerAnalysis,
} from "./PlannerTypes";

export class PlannerAnalyzer {
  analyze(
    input: CreatePlanInput
  ): PlannerAnalysis {
    const text =
      input.objective
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const capabilities =
      new Set<string>();

    if (
      this.contains(
        text,
        [
          "souviens",
          "memoire",
          "historique",
        ]
      )
    ) {
      capabilities.add(
        "memory"
      );
    }

    if (
      this.contains(
        text,
        [
          "agenda",
          "calendrier",
          "rendez-vous",
          "rdv",
        ]
      )
    ) {
      capabilities.add(
        "calendar"
      );
    }

    if (
      this.contains(
        text,
        [
          "web",
          "internet",
          "recherche",
          "cherche",
        ]
      )
    ) {
      capabilities.add("web");
    }

    if (
      this.contains(
        text,
        [
          "entreprise",
          "chantier",
          "client",
          "devis",
        ]
      )
    ) {
      capabilities.add(
        "business"
      );
    }

    if (
      capabilities.size === 0
    ) {
      capabilities.add(
        "planning"
      );
    }

    const wordCount =
      input.objective
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;

    const complexity =
      wordCount < 8
        ? "simple"
        : wordCount < 20
        ? "moderate"
        : "complex";

    return {
      objective:
        input.objective,
      detectedCapabilities:
        Array.from(
          capabilities
        ),
      complexity,
      requiresValidation:
        capabilities.has(
          "calendar"
        ) ||
        capabilities.has(
          "business"
        ),
    };
  }

  private contains(
    text: string,
    terms: string[]
  ) {
    return terms.some(
      (term) =>
        text.includes(term)
    );
  }
}
