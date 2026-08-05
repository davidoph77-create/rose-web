import {
  CoreModule,
  CoreRecommendation,
  CoreStatus,
} from "../types/core";

export type PlanStep = {
  order: number;
  title: string;
  requiresValidation: boolean;
};

export type PlannerInput = {
  recommendations: CoreRecommendation[];
};

export type PlannerResult = {
  steps: PlanStep[];
};

export class PlannerEngine
  implements CoreModule<PlannerInput, PlannerResult>
{
  readonly id = "planner-engine";
  readonly name = "Planner Engine";
  readonly version = "1.0.0";
  readonly maturity = 1 as const;

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
      return {
        steps: input.recommendations.map(
          (recommendation, index) => ({
            order: index + 1,
            title: recommendation.title,
            requiresValidation:
              recommendation.requiresValidation,
          })
        ),
      };
    } finally {
      this.status = "ready";
    }
  }
}
