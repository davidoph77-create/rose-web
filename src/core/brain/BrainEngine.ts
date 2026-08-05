import { AgentManager } from "../agents/AgentManager";
import { ContextEngine } from "../context/ContextEngine";
import { EventBus } from "../events/EventBus";
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
  readonly version = "1.1.0";
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

  constructor(
    private readonly eventBus: EventBus = new EventBus()
  ) {}

  getStatus(): CoreStatus {
    return this.status;
  }

  getEventBus(): EventBus {
    return this.eventBus;
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

    await this.eventBus.publish(
      "core.initialized",
      {
        moduleId: this.id,
        version: this.version,
      },
      this.id
    );
  }

  async execute(input: CoreInput): Promise<CoreOutput> {
    this.status = "running";
    const trace: CoreTraceStep[] = [];

    await this.eventBus.publish(
      "brain.request.received",
      {
        message: input.message,
        userId: input.userId,
      },
      this.id
    );

    try {
      const context =
        await this.contextEngine.execute(input);

      trace.push(
        this.makeTrace(
          this.contextEngine.id,
          "Contexte et intention analysés"
        )
      );

      await this.eventBus.publish(
        "context.analyzed",
        {
          intent: context.intent,
          domains: context.domains,
          confidence: context.confidence,
        },
        this.contextEngine.id
      );

      const memory =
        await this.memoryEngine.execute(context);

      trace.push(
        this.makeTrace(
          this.memoryEngine.id,
          `${memory.relevantMemories.length} mémoire(s) pertinente(s)`
        )
      );

      await this.eventBus.publish(
        "memory.searched",
        memory,
        this.memoryEngine.id
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

      await this.eventBus.publish(
        "reasoning.completed",
        reasoning,
        this.reasoningEngine.id
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

      await this.eventBus.publish(
        "plan.created",
        plan,
        this.plannerEngine.id
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

      await this.eventBus.publish(
        "agents.selected",
        agents,
        this.agentManager.id
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

      await this.eventBus.publish(
        "explanation.generated",
        explanation,
        this.explainEngine.id
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

      await this.eventBus.publish(
        "personality.applied",
        { response },
        this.personalityEngine.id
      );

      const output: CoreOutput = {
        success: true,
        response,
        context,
        recommendations:
          reasoning.recommendations,
        trace,
        missingInformation:
          reasoning.missingInformation,
      };

      await this.eventBus.publish(
        "brain.response.ready",
        output,
        this.id
      );

      return output;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur inconnue";

      trace.push({
        id: `error-${Date.now()}`,
        moduleId: this.id,
        label: "Erreur pendant l’orchestration",
        status: "error",
        detail: message,
        createdAt: new Date().toISOString(),
      });

      await this.eventBus.publish(
        "core.error",
        { message },
        this.id
      );

      throw error;
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
