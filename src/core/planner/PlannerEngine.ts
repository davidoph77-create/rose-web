import { CoreModule, CoreStatus } from "../types/core";
import {
  Plan,
  PlanPriority,
  PlanRiskLevel,
  PlanStep,
  PlanStepStatus,
  PlannerInput,
  PlannerResult,
} from "./types";

export type PlannerCommand =
  | { type: "create"; input: PlannerInput }
  | { type: "start_step"; plan: Plan; stepId: string }
  | { type: "complete_step"; plan: Plan; stepId: string }
  | { type: "block_step"; plan: Plan; stepId: string; reason: string }
  | { type: "cancel_step"; plan: Plan; stepId: string }
  | { type: "recalculate"; plan: Plan };

export class PlannerEngine
  implements CoreModule<PlannerInput, PlannerResult>
{
  readonly id = "planner-engine";
  readonly name = "Planner Engine";
  readonly version = "2.0.0";
  readonly maturity = 2 as const;

  private status: CoreStatus = "idle";

  getStatus(): CoreStatus {
    return this.status;
  }

  async initialize(): Promise<void> {
    this.status = "initializing";
    this.status = "ready";
  }

  async execute(input: PlannerInput): Promise<PlannerResult> {
    this.status = "running";
    try {
      return { plan: this.createPlan(input) };
    } finally {
      this.status = "ready";
    }
  }

  executeCommand(command: PlannerCommand): Plan {
    switch (command.type) {
      case "create":
        return this.createPlan(command.input);
      case "start_step":
        return this.updateStepStatus(command.plan, command.stepId, "in_progress");
      case "complete_step":
        return this.updateStepStatus(command.plan, command.stepId, "done");
      case "block_step":
        return this.updateStepStatus(
          command.plan,
          command.stepId,
          "blocked",
          command.reason
        );
      case "cancel_step":
        return this.updateStepStatus(command.plan, command.stepId, "cancelled");
      case "recalculate":
        return this.recalculatePlan(command.plan);
    }
  }

  createPlan(input: PlannerInput): Plan {
    const now = new Date().toISOString();
    const objective =
      input.objective?.trim() || "Traiter les recommandations de Rose";

    const steps = input.recommendations.map(
      (recommendation, index): PlanStep => {
        const priority = this.priorityFromConfidence(
          recommendation.confidence
        );

        return {
          id: this.createId("step"),
          order: index + 1,
          title: recommendation.title,
          description: recommendation.reason,
          priority,
          status: "pending",
          estimatedMinutes: this.estimateDuration(priority),
          requiresValidation: recommendation.requiresValidation,
          dependencies: index === 0 ? [] : [String(index)],
          createdAt: now,
          updatedAt: now,
        };
      }
    );

    return {
      id: this.createId("plan"),
      objective,
      summary:
        steps.length > 0
          ? `${steps.length} étape(s) structurée(s) pour atteindre l’objectif.`
          : "Aucune étape n’a encore été générée.",
      priority: this.getHighestPriority(steps),
      riskLevel: this.calculateRiskLevel(steps),
      steps,
      totalEstimatedMinutes: this.totalDuration(steps),
      requiresValidation: steps.some((step) => step.requiresValidation),
      createdAt: now,
      updatedAt: now,
    };
  }

  private updateStepStatus(
    plan: Plan,
    stepId: string,
    status: PlanStepStatus,
    blockedReason?: string
  ): Plan {
    const now = new Date().toISOString();

    const steps = plan.steps.map((step) => {
      if (step.id !== stepId) return step;

      if (
        status === "in_progress" &&
        !this.dependenciesCompleted(plan, step)
      ) {
        return {
          ...step,
          status: "blocked" as const,
          blockedReason:
            "Une ou plusieurs dépendances ne sont pas terminées.",
          updatedAt: now,
        };
      }

      return {
        ...step,
        status,
        blockedReason:
          status === "blocked"
            ? blockedReason || "Étape bloquée sans raison précisée."
            : undefined,
        updatedAt: now,
      };
    });

    return this.recalculatePlan({ ...plan, steps, updatedAt: now });
  }

  private recalculatePlan(plan: Plan): Plan {
    const remaining = plan.steps.filter(
      (step) => step.status !== "done" && step.status !== "cancelled"
    );

    return {
      ...plan,
      priority: this.getHighestPriority(plan.steps),
      riskLevel: this.calculateRiskLevel(plan.steps),
      totalEstimatedMinutes: this.totalDuration(remaining),
      requiresValidation: remaining.some(
        (step) => step.requiresValidation
      ),
      updatedAt: new Date().toISOString(),
    };
  }

  private dependenciesCompleted(plan: Plan, step: PlanStep): boolean {
    if (step.dependencies.length === 0) return true;

    return step.dependencies.every((dependencyOrder) => {
      const dependency = plan.steps.find(
        (candidate) => String(candidate.order) === dependencyOrder
      );
      return dependency?.status === "done";
    });
  }

  private priorityFromConfidence(confidence: number): PlanPriority {
    if (confidence >= 0.9) return "critical";
    if (confidence >= 0.8) return "high";
    if (confidence >= 0.65) return "medium";
    return "low";
  }

  private estimateDuration(priority: PlanPriority): number {
    switch (priority) {
      case "critical":
        return 45;
      case "high":
        return 30;
      case "medium":
        return 20;
      case "low":
        return 10;
    }
  }

  private calculateRiskLevel(steps: PlanStep[]): PlanRiskLevel {
    if (
      steps.some(
        (step) =>
          step.priority === "critical" || step.status === "blocked"
      )
    ) {
      return "high";
    }

    if (
      steps.some(
        (step) =>
          step.priority === "high" || step.requiresValidation
      )
    ) {
      return "medium";
    }

    return "low";
  }

  private getHighestPriority(steps: PlanStep[]): PlanPriority {
    const order: PlanPriority[] = [
      "critical",
      "high",
      "medium",
      "low",
    ];

    return (
      order.find((priority) =>
        steps.some((step) => step.priority === priority)
      ) || "low"
    );
  }

  private totalDuration(steps: PlanStep[]): number {
    return steps.reduce(
      (total, step) => total + step.estimatedMinutes,
      0
    );
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
}
