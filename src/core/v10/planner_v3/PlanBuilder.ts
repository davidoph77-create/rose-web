import {
  CreatePlanInput,
  Plan,
  PlanStep,
  PlannerAnalysis,
} from "./PlannerTypes";

export class PlanBuilder {
  build(
    input: CreatePlanInput,
    analysis: PlannerAnalysis
  ): Plan {
    const now =
      new Date().toISOString();

    const steps:
      PlanStep[] = [];

    steps.push(
      this.step(
        1,
        "Comprendre l’objectif",
        "Analyser la demande et le contexte.",
        "planning",
        "normal",
        false
      )
    );

    let order = 2;

    for (
      const capability of
      analysis.detectedCapabilities
    ) {
      if (
        capability ===
        "planning"
      ) {
        continue;
      }

      steps.push(
        this.step(
          order,
          `Consulter ${capability}`,
          `Solliciter la capacité ${capability} nécessaire à l’objectif.`,
          capability,
          capability ===
            "memory"
            ? "high"
            : "normal",
          capability ===
            "calendar" ||
            capability ===
              "business"
        )
      );

      order += 1;
    }

    steps.push(
      this.step(
        order,
        "Construire la réponse",
        "Fusionner les informations obtenues et préparer la prochaine action.",
        "planning",
        "high",
        analysis.requiresValidation
      )
    );

    return {
      id:
        `plan-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,
      objective:
        input.objective,
      createdAt: now,
      updatedAt: now,
      status: "ready",
      steps,
      metadata: {
        ...(input.context ??
          {}),
        complexity:
          analysis.complexity,
      },
    };
  }

  private step(
    order: number,
    title: string,
    description: string,
    capability: string,
    priority:
      | "low"
      | "normal"
      | "high"
      | "critical",
    requiresValidation:
      boolean
  ): PlanStep {
    return {
      id:
        `step-${Date.now()}-${order}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      title,
      description,
      order,
      priority,
      status: "ready",
      requiresValidation,
      dependencies: [],
      assignedCapability:
        capability,
    };
  }
}
