import { AgentManager } from "../agents/AgentManager";
import { ContextEngine } from "../context/ContextEngine";
import { ExplainEngine } from "../explain/ExplainEngine";
import { MemoryEngine } from "../memory/MemoryEngine";
import { PersonalityEngine } from "../personality/PersonalityEngine";
import { PlannerEngine } from "../planner/PlannerEngine";
import { ReasoningEngine } from "../reasoning/ReasoningEngine";
import {
  CoreInput,
  CoreModule,
  CoreOutput,
  CoreStatus,
  CoreTraceStep,
} from "../types/core";

export class BrainEngine
  implements CoreModule<CoreInput, CoreOutput>
{
  readonly id = "brain-engine";
  readonly name = "Brain Engine";
  readonly version = "1.0.0";
  readonly maturity = 1 as const;

  private status: CoreStatus = "idle";

  private readonly contextEngine = new ContextEngine();
  private readonly memoryEngine = new MemoryEngine();
  private readonly reasoningEngine = new ReasoningEngine();
  private readonly plannerEngine = new PlannerEngine();
  private readonly personalityEngine =
    new PersonalityEngine();
  private readonly explainEngine = new ExplainEngine();
  private readonly agentManager = new AgentManager();

  getStatus(): CoreStatus {
    return this.status;
  }

  async initialize(): Promise<void> {
    this.status = "initializing";

    await Promise.all([
      this.contextEngine.initialize(),
      this.memoryEngine.initialize(),
      this.reasoningEngine.initialize(),
      this.plannerEngine.initialize(),
      this.personalityEngine.initialize(),
      this.explainEngine.initialize(),
      this.agentManager.initialize(),
    ]);

    this.status = "ready";
  }

  async execute(input: CoreInput): Promise<CoreOutput> {
    this.status = "running";
    const trace: CoreTraceStep[] = [];

    try {
      const context =
        await this.contextEngine.execute(input);

      trace.push(
        this.makeTrace(
          this.contextEngine.id,
          "Contexte et intention analysés"
        )
      );

      const memory =
        await this.memoryEngine.execute(context);

      trace.push(
        this.makeTrace(
          this.memoryEngine.id,
          `${memory.relevantMemories.length} mémoire(s) pertinente(s)`
        )
      );

      const reasoning =
        await this.reasoningEngine.execute({
          context,
          memory,
        });

      trace.push(
        this.makeTrace(
          this.reasoningEngine.id,
          reasoning.summary
        )
      );

      const plan =
        await this.plannerEngine.execute({
          recommendations:
            reasoning.recommendations,
        });

      trace.push(
        this.makeTrace(
          this.plannerEngine.id,
          `${plan.steps.length} étape(s) préparée(s)`
        )
      );

      const agents =
        await this.agentManager.execute(context);

      trace.push(
        this.makeTrace(
          this.agentManager.id,
          agents.agentIds.length > 0
            ? `Agents sélectionnés : ${agents.agentIds.join(", ")}`
            : "Aucun agent spécialisé nécessaire"
        )
      );

      const explanation =
        await this.explainEngine.execute({
          context,
          recommendations:
            reasoning.recommendations,
          memoryCount:
            memory.relevantMemories.length,
        });

      trace.push(
        this.makeTrace(
          this.explainEngine.id,
          "Explication générée"
        )
      );

      const baseResponse = [
        reasoning.summary,
        plan.steps.length > 0
          ? `Plan préparé : ${plan.steps
              .map((step) => step.title)
              .join(" → ")}.`
          : "",
        explanation.explanation,
        "Rose réfléchit. Rose explique. David décide.",
      ]
        .filter(Boolean)
        .join("\n\n");

      const response =
        await this.personalityEngine.execute({
          text: baseResponse,
          userName:
            typeof input.metadata?.userName === "string"
              ? input.metadata.userName
              : undefined,
        });

      trace.push(
        this.makeTrace(
          this.personalityEngine.id,
          "Personnalité de Rose appliquée"
        )
      );

      return {
        success: true,
        response,
        context,
        recommendations:
          reasoning.recommendations,
        trace,
        missingInformation:
          reasoning.missingInformation,
      };
    } finally {
      this.status = "ready";
    }
  }

  private makeTrace(
    moduleId: string,
    detail: string
  ): CoreTraceStep {
    return {
      id: `${moduleId}-${Date.now()}-${Math.random()}`,
      moduleId,
      label: moduleId,
      status: "success",
      detail,
      createdAt: new Date().toISOString(),
    };
  }
}
