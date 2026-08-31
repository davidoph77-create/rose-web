import {
  PlannerEngineV3,
} from "../planner_v3";
import {
  MemoryEngine,
} from "../memory";
import {
  GoalAnalyzer,
} from "./GoalAnalyzer";
import {
  GoalStore,
} from "./GoalStore";
import {
  CreateGoalInput,
  Goal,
  GoalStatus,
} from "./GoalTypes";

export class GoalEngineV3 {
  readonly version = "10.0.8";

  constructor(
    private readonly analyzer =
      new GoalAnalyzer(),
    private readonly store =
      new GoalStore(),
    private readonly planner?: PlannerEngineV3,
    private readonly memory?: MemoryEngine
  ) {}

  createGoal(
    input: CreateGoalInput
  ) {
    if (!input.title.trim()) {
      throw new Error(
        "Le titre de l'objectif est vide."
      );
    }

    const analysis =
      this.analyzer.analyze(
        input
      );

    const now =
      new Date().toISOString();

    const goal: Goal = {
      id:
        `goal-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 10)}`,
      title: input.title,
      description:
        input.description,
      priority:
        analysis.urgency,
      status: "active",
      createdAt: now,
      updatedAt: now,
      targetDate:
        input.targetDate,
      progress: {
        percent: 0,
        completedSteps: 0,
        totalSteps: 0,
        updatedAt: now,
      },
      tags: [
        ...(input.tags ?? []),
      ],
      metadata: {
        ...(input.metadata ?? {}),
        analysis,
      },
    };

    let plan = undefined;
    let memories = undefined;

    if (
      analysis.needsPlan &&
      this.planner
    ) {
      const built =
        this.planner.createPlan({
          objective:
            input.title,
          context: {
            goalId:
              goal.id,
            description:
              input.description,
          },
        });

      plan = built.plan;
      goal.planId =
        plan.id;
      goal.progress.totalSteps =
        plan.steps.length;
    }

    if (
      analysis.memoryRelevant &&
      this.memory
    ) {
      memories =
        this.memory.search({
          text:
            `${input.title} ${input.description ?? ""}`,
          limit: 5,
        });
    }

    this.store.save(goal);

    return {
      goal:
        this.store.get(goal.id)!,
      analysis,
      plan,
      memories,
    };
  }

  getGoal(id: string) {
    return this.store.get(id);
  }

  listGoals() {
    return this.store.all();
  }

  deleteGoal(id: string) {
    return this.store.delete(id);
  }

  setStatus(
    id: string,
    status: GoalStatus
  ) {
    const goal =
      this.requireGoal(id);

    goal.status = status;
    goal.updatedAt =
      new Date().toISOString();

    return this.store.save(
      goal
    );
  }

  updateProgress(
    id: string,
    completedSteps: number,
    totalSteps?: number
  ) {
    const goal =
      this.requireGoal(id);

    const total =
      Math.max(
        0,
        totalSteps ??
          goal.progress.totalSteps
      );

    const completed =
      Math.max(
        0,
        Math.min(
          completedSteps,
          total || completedSteps
        )
      );

    const percent =
      total > 0
        ? Math.round(
            (completed / total) *
              100
          )
        : completed > 0
        ? 100
        : 0;

    goal.progress = {
      percent:
        Math.max(
          0,
          Math.min(
            100,
            percent
          )
        ),
      completedSteps:
        completed,
      totalSteps:
        total,
      updatedAt:
        new Date().toISOString(),
    };

    goal.updatedAt =
      new Date().toISOString();

    if (
      goal.progress.percent >=
      100
    ) {
      goal.status =
        "completed";
    }

    return this.store.save(
      goal
    );
  }

  private requireGoal(
    id: string
  ): Goal {
    const goal =
      this.store.get(id);

    if (!goal) {
      throw new Error(
        `Objectif introuvable : ${id}`
      );
    }

    return goal;
  }
}
