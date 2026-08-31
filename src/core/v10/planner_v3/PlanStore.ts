import {
  Plan,
} from "./PlannerTypes";

export class PlanStore {
  private readonly plans =
    new Map<string, Plan>();

  save(plan: Plan): Plan {
    this.plans.set(
      plan.id,
      {
        ...plan,
        steps:
          plan.steps.map(
            (step) => ({
              ...step,
              dependencies: [
                ...step.dependencies,
              ],
            })
          ),
      }
    );

    return this.get(plan.id)!;
  }

  get(id: string):
    | Plan
    | undefined {
    const plan =
      this.plans.get(id);

    if (!plan) {
      return undefined;
    }

    return {
      ...plan,
      steps:
        plan.steps.map(
          (step) => ({
            ...step,
            dependencies: [
              ...step.dependencies,
            ],
          })
        ),
    };
  }

  all(): Plan[] {
    return Array.from(
      this.plans.values()
    ).map(
      (plan) => ({
        ...plan,
        steps:
          plan.steps.map(
            (step) => ({
              ...step,
              dependencies: [
                ...step.dependencies,
              ],
            })
          ),
      })
    );
  }

  delete(id: string): boolean {
    return this.plans.delete(id);
  }
}
