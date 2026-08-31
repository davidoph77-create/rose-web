import {
  CreatePlanInput,
} from "./PlannerTypes";
import {
  PlannerAnalyzer,
} from "./PlannerAnalyzer";
import {
  PlanBuilder,
} from "./PlanBuilder";
import {
  PlanStore,
} from "./PlanStore";

export class PlannerEngineV3 {
  readonly version = "10.0.7";

  constructor(
    private readonly analyzer =
      new PlannerAnalyzer(),
    private readonly builder =
      new PlanBuilder(),
    private readonly store =
      new PlanStore()
  ) {}

  createPlan(
    input: CreatePlanInput
  ) {
    const analysis =
      this.analyzer.analyze(
        input
      );

    const plan =
      this.builder.build(
        input,
        analysis
      );

    this.store.save(plan);

    return {
      analysis,
      plan,
    };
  }

  getPlan(id: string) {
    return this.store.get(id);
  }

  listPlans() {
    return this.store.all();
  }

  deletePlan(id: string) {
    return this.store.delete(id);
  }

  markStep(
    planId: string,
    stepId: string,
    status:
      | "pending"
      | "ready"
      | "running"
      | "done"
      | "blocked"
      | "cancelled"
  ) {
    const plan =
      this.store.get(planId);

    if (!plan) {
      throw new Error(
        `Plan introuvable : ${planId}`
      );
    }

    const step =
      plan.steps.find(
        (item) =>
          item.id === stepId
      );

    if (!step) {
      throw new Error(
        `Étape introuvable : ${stepId}`
      );
    }

    step.status = status;
    plan.updatedAt =
      new Date().toISOString();

    if (
      plan.steps.every(
        (item) =>
          item.status === "done"
      )
    ) {
      plan.status = "done";
    } else if (
      plan.steps.some(
        (item) =>
          item.status === "running"
      )
    ) {
      plan.status = "running";
    }

    return this.store.save(
      plan
    );
  }
}
