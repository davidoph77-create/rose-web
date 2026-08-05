import {
  CoreContext,
  CoreModule,
  CoreRecommendation,
  CoreStatus,
} from "../types/core";
import { MemorySummary } from "../memory/MemoryEngine";

export type ReasoningInput = {
  context: CoreContext;
  memory: MemorySummary;
};

export type ReasoningResult = {
  summary: string;
  recommendations: CoreRecommendation[];
  missingInformation: string[];
};

export class ReasoningEngine
  implements CoreModule<ReasoningInput, ReasoningResult>
{
  readonly id = "reasoning-engine";
  readonly name = "Reasoning Engine";
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

  async execute(input: ReasoningInput): Promise<ReasoningResult> {
    this.status = "running";

    try {
      const recommendations: CoreRecommendation[] = [];
      const missingInformation: string[] = [];

      if (input.context.intent === "plan") {
        recommendations.push({
          title: "Construire un plan d’action",
          reason:
            "La demande contient une intention d’organisation ou de planification.",
          confidence: input.context.confidence,
          requiresValidation: true,
        });
      }

      if (input.context.intent === "search") {
        recommendations.push({
          title: "Préparer une recherche Web",
          reason:
            "La demande nécessite probablement des informations externes.",
          confidence: input.context.confidence,
          requiresValidation: true,
        });
      }

      if (input.context.intent === "schedule") {
        recommendations.push({
          title: "Préparer un événement Agenda",
          reason:
            "La demande contient un rappel ou un rendez-vous.",
          confidence: input.context.confidence,
          requiresValidation: true,
        });
      }

      if (
        input.memory.relevantMemories.length === 0 &&
        input.context.intent !== "conversation"
      ) {
        missingInformation.push(
          "Aucune mémoire directement pertinente n’a été trouvée."
        );
      }

      return {
        summary:
          recommendations.length > 0
            ? "Rose a identifié une ou plusieurs actions possibles."
            : "Rose a compris la demande, mais aucune action spécialisée n’est encore nécessaire.",
        recommendations,
        missingInformation,
      };
    } finally {
      this.status = "ready";
    }
  }
}
