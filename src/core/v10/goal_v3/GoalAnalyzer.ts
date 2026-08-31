import {
  CreateGoalInput,
  GoalAnalysis,
  GoalPriority,
} from "./GoalTypes";

export class GoalAnalyzer {
  analyze(
    input: CreateGoalInput
  ): GoalAnalysis {
    const text =
      `${input.title} ${input.description ?? ""}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    let urgency: GoalPriority =
      input.priority ?? "normal";

    const reasons: string[] = [];

    if (
      this.contains(
        text,
        ["urgent", "aujourd'hui", "immediat", "prioritaire"]
      )
    ) {
      urgency = "critical";
      reasons.push(
        "L'objectif contient des marqueurs d'urgence."
      );
    } else if (
      this.contains(
        text,
        ["important", "rapidement", "cette semaine"]
      )
    ) {
      urgency = "high";
      reasons.push(
        "L'objectif semble prioritaire."
      );
    }

    const needsPlan =
      this.contains(
        text,
        [
          "organiser",
          "plan",
          "etape",
          "projet",
          "preparer",
          "construire",
          "developper",
        ]
      ) ||
      text.split(/\s+/).length > 10;

    const memoryRelevant =
      this.contains(
        text,
        [
          "souviens",
          "memoire",
          "historique",
          "projet",
          "decision",
        ]
      );

    if (needsPlan) {
      reasons.push(
        "L'objectif nécessite probablement un plan structuré."
      );
    }

    if (memoryRelevant) {
      reasons.push(
        "Des souvenirs existants peuvent aider à atteindre cet objectif."
      );
    }

    if (reasons.length === 0) {
      reasons.push(
        "Objectif simple sans contrainte spéciale détectée."
      );
    }

    return {
      title: input.title,
      urgency,
      needsPlan,
      memoryRelevant,
      reasons,
    };
  }

  private contains(
    text: string,
    terms: string[]
  ): boolean {
    return terms.some(
      (term) =>
        text.includes(term)
    );
  }
}
