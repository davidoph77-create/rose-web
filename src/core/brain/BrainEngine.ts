import { AgentManager } from "../agents/AgentManager";
import {
  CognitiveMemoryEngine,
  RankedMemory,
} from "../cognitive";
import { ContextEngine } from "../context/ContextEngine";
import { EventBus } from "../events/EventBus";
import { ExplainEngine } from "../explain/ExplainEngine";
import {
  GoalEngine,
} from "../goals";
import {
  KnowledgeEntity,
  KnowledgeGraphEngine,
} from "../knowledge";
import {
  MemoryEngine,
  MemorySummary,
} from "../memory/MemoryEngine";
import { PersonalityEngine } from "../personality/PersonalityEngine";
import {
  Plan,
  PlannerEngine,
} from "../planner";
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
  readonly version = "1.4.0";
  readonly maturity = 2 as const;

  private status: CoreStatus = "idle";

  private readonly contextEngine =
    new ContextEngine();
  private readonly memoryEngine =
    new MemoryEngine();
  private readonly cognitiveMemoryEngine =
    new CognitiveMemoryEngine();
  private readonly knowledgeGraphEngine =
    new KnowledgeGraphEngine();
  private readonly reasoningEngine =
    new ReasoningEngine();
  private readonly plannerEngine =
    new PlannerEngine();
  private readonly goalEngine =
    new GoalEngine();
  private readonly personalityEngine =
    new PersonalityEngine();
  private readonly explainEngine =
    new ExplainEngine();
  private readonly agentManager =
    new AgentManager();

  constructor(
    private readonly eventBus:
      EventBus = new EventBus()
  ) {}

  getStatus(): CoreStatus {
    return this.status;
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getCognitiveMemory():
    CognitiveMemoryEngine {
    return this.cognitiveMemoryEngine;
  }

  getKnowledgeGraph():
    KnowledgeGraphEngine {
    return this.knowledgeGraphEngine;
  }

  getPlanner(): PlannerEngine {
    return this.plannerEngine;
  }

  getGoals(): GoalEngine {
    return this.goalEngine;
  }

  async initialize(): Promise<void> {
    this.status = "initializing";

    await Promise.all([
      this.contextEngine.initialize(),
      this.memoryEngine.initialize(),
      this.cognitiveMemoryEngine.initialize(),
      this.knowledgeGraphEngine.initialize(),
      this.reasoningEngine.initialize(),
      this.plannerEngine.initialize(),
      this.goalEngine.initialize(),
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

  async execute(
    input: CoreInput
  ): Promise<CoreOutput> {
    this.status = "running";
    const trace:
      CoreTraceStep[] = [];

    try {
      const context =
        await this.contextEngine.execute(
          input
        );

      const historicalMemory =
        await this.memoryEngine.execute(
          context
        );

      const cognitiveResults =
        this.cognitiveMemoryEngine.search({
          text: input.message,
          limit: 5,
        });

      const knowledgeExtraction =
        this.knowledgeGraphEngine.extract(
          input.message
        );

      const combinedMemory =
        this.combineMemories(
          historicalMemory,
          cognitiveResults
        );

      const reasoning =
        await this.reasoningEngine.execute({
          context,
          memory: combinedMemory,
        });

      const plannerResult =
        await this.plannerEngine.execute({
          objective: input.message,
          recommendations:
            reasoning.recommendations,
        });

      const plan = plannerResult.plan;

      await this.eventBus.publish(
        "plan.created",
        plan,
        this.plannerEngine.id
      );

      const agents =
        await this.agentManager.execute(
          context
        );

      const explanation =
        await this.explainEngine.execute({
          context,
          recommendations:
            reasoning.recommendations,
          memoryCount:
            combinedMemory
              .relevantMemories.length,
        });

      const activeGoals =
        await this.goalEngine.execute({
          type: "list",
        });

      const goalsSummary =
        Array.isArray(activeGoals)
          ? this.describeGoals(
              activeGoals
            )
          : "";

      const baseResponse = [
        reasoning.summary,
        goalsSummary,
        this.describePlan(plan),
        this.describeKnowledge(
          knowledgeExtraction.entities
        ),
        explanation.explanation,
        "Rose réfléchit. Rose explique. David décide.",
      ]
        .filter(Boolean)
        .join("\n\n");

      const response =
        await this.personalityEngine.execute({
          text: baseResponse,
          userName:
            typeof input.metadata?.userName ===
            "string"
              ? input.metadata.userName
              : undefined,
        });

      trace.push(
        this.makeTrace(
          this.goalEngine.id,
          Array.isArray(activeGoals)
            ? `${activeGoals.length} objectif(s) chargé(s)`
            : "Aucun objectif chargé"
        )
      );

      trace.push(
        this.makeTrace(
          this.plannerEngine.id,
          `${plan.steps.length} étape(s), ` +
            `${plan.totalEstimatedMinutes} minute(s), ` +
            `risque ${plan.riskLevel}`
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

  private describeGoals(
    goals: Array<{
      title: string;
      progress: number;
      status: string;
    }>
  ): string {
    const active = goals.filter(
      (goal) =>
        goal.status === "active" ||
        goal.status === "blocked"
    );

    if (active.length === 0) {
      return "";
    }

    return `Objectifs suivis : ${active
      .slice(0, 3)
      .map(
        (goal) =>
          `${goal.title} (${Math.round(
            goal.progress
          )} %)`
      )
      .join(", ")}.`;
  }

  private describePlan(
    plan: Plan
  ): string {
    if (plan.steps.length === 0) {
      return "";
    }

    return (
      `Plan : ${plan.steps
        .map(
          (step) =>
            `${step.order}. ${step.title}`
        )
        .join(" → ")}. ` +
      `Durée estimée : ${plan.totalEstimatedMinutes} min. ` +
      `Risque : ${plan.riskLevel}.`
    );
  }

  private combineMemories(
    historical: MemorySummary,
    cognitive: RankedMemory[]
  ): MemorySummary {
    return {
      relevantMemories:
        Array.from(
          new Set([
            ...historical.relevantMemories,
            ...cognitive.map(
              (result) =>
                result.memory.content
            ),
          ])
        ).slice(0, 8),
      sourceCount:
        historical.sourceCount +
        this.cognitiveMemoryEngine
          .getAll().length,
    };
  }

  private describeKnowledge(
    entities: KnowledgeEntity[]
  ): string {
    if (entities.length === 0) {
      return "";
    }

    return `Connaissances détectées : ${entities
      .map(
        (entity) =>
          entity.label
      )
      .join(", ")}.`;
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
      createdAt:
        new Date().toISOString(),
    };
  }
}
