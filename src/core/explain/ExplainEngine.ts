import {
  CoreContext,
  CoreModule,
  CoreRecommendation,
  CoreStatus,
} from "../types/core";

export type ExplainInput = {
  context: CoreContext;
  recommendations: CoreRecommendation[];
  memoryCount: number;
};

export type ExplainResult = {
  explanation: string;
};

export class ExplainEngine
  implements CoreModule<ExplainInput, ExplainResult>
{
  readonly id = "explain-engine";
  readonly name = "Explain Engine";
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

  async execute(input: ExplainInput): Promise<ExplainResult> {
    this.status = "running";

    try {
      return {
        explanation:
          `Intention détectée : ${input.context.intent}. ` +
          `Domaines consultés : ${input.context.domains.join(", ")}. ` +
          `Mémoires pertinentes : ${input.memoryCount}. ` +
          `Recommandations préparées : ${input.recommendations.length}. ` +
          `Confiance : ${Math.round(
            input.context.confidence * 100
          )} %.`,
      };
    } finally {
      this.status = "ready";
    }
  }
}
