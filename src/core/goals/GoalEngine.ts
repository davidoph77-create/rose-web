import {
  CoreModule,
  CoreStatus,
} from "../types/core";
import {
  CreateGoalInput,
  Goal,
  GoalEngineResult,
  GoalMilestone,
  GoalPriority,
  GoalStatus,
} from "./types";

export type GoalCommand =
  | {
      type: "create";
      input: CreateGoalInput;
    }
  | {
      type: "get";
      id: string;
    }
  | {
      type: "list";
    }
  | {
      type: "activate";
      id: string;
    }
  | {
      type: "pause";
      id: string;
    }
  | {
      type: "cancel";
      id: string;
    }
  | {
      type: "complete";
      id: string;
    }
  | {
      type: "block";
      id: string;
      reason: string;
    }
  | {
      type: "update_progress";
      id: string;
      value: number;
      note?: string;
    }
  | {
      type: "complete_milestone";
      goalId: string;
      milestoneId: string;
    }
  | {
      type: "remove";
      id: string;
    };

export class GoalEngine
  implements CoreModule<GoalCommand, GoalEngineResult>
{
  readonly id = "goal-engine";
  readonly name = "Goal Engine";
  readonly version = "2.0.0";
  readonly maturity = 2 as const;

  private status: CoreStatus = "idle";
  private readonly goals = new Map<string, Goal>();

  getStatus(): CoreStatus {
    return this.status;
  }

  async initialize(): Promise<void> {
    this.status = "initializing";
    this.status = "ready";
  }

  async execute(
    command: GoalCommand
  ): Promise<GoalEngineResult> {
    this.status = "running";

    try {
      switch (command.type) {
        case "create":
          return this.createGoal(command.input);

        case "get":
          return this.goals.get(command.id);

        case "list":
          return this.getAll();

        case "activate":
          return this.changeStatus(
            command.id,
            "active"
          );

        case "pause":
          return this.changeStatus(
            command.id,
            "paused"
          );

        case "cancel":
          return this.changeStatus(
            command.id,
            "cancelled"
          );

        case "complete":
          return this.completeGoal(command.id);

        case "block":
          return this.blockGoal(
            command.id,
            command.reason
          );

        case "update_progress":
          return this.updateProgress(
            command.id,
            command.value,
            command.note
          );

        case "complete_milestone":
          return this.completeMilestone(
            command.goalId,
            command.milestoneId
          );

        case "remove":
          return this.goals.delete(command.id);
      }
    } finally {
      this.status = "ready";
    }
  }

  createGoal(input: CreateGoalInput): Goal {
    const now = new Date().toISOString();

    const milestones: GoalMilestone[] =
      (input.milestones ?? []).map(
        (milestone, index) => ({
          id: this.createId("milestone"),
          title: milestone.title.trim(),
          description:
            milestone.description?.trim(),
          order: index + 1,
          completed: false,
          dueAt: milestone.dueAt,
        })
      );

    const currentValue =
      input.currentValue ?? 0;
    const targetValue = input.targetValue;
    const progress = this.calculateProgress(
      currentValue,
      targetValue,
      milestones
    );

    const goal: Goal = {
      id: this.createId("goal"),
      title: input.title.trim(),
      description:
        input.description?.trim() ?? "",
      category: input.category ?? "other",
      status: "draft",
      priority: input.priority ?? "medium",
      progress,
      targetValue,
      currentValue,
      unit: input.unit,
      milestones,
      dependencies:
        input.dependencies ?? [],
      requiresValidation:
        input.requiresValidation ?? true,
      createdAt: now,
      updatedAt: now,
      dueAt: input.dueAt,
      history: [
        {
          id: this.createId("progress"),
          value: progress,
          note: "Objectif créé",
          createdAt: now,
        },
      ],
    };

    this.goals.set(goal.id, goal);
    return goal;
  }

  getAll(): Goal[] {
    return Array.from(
      this.goals.values()
    ).sort((a, b) => {
      const priorityOrder: GoalPriority[] = [
        "critical",
        "high",
        "medium",
        "low",
      ];

      return (
        priorityOrder.indexOf(a.priority) -
        priorityOrder.indexOf(b.priority)
      );
    });
  }

  private changeStatus(
    id: string,
    status: GoalStatus
  ): Goal {
    const goal = this.requireGoal(id);
    const now = new Date().toISOString();

    if (
      status === "active" &&
      !this.dependenciesCompleted(goal)
    ) {
      const blocked: Goal = {
        ...goal,
        status: "blocked",
        blockedReason:
          "Un ou plusieurs objectifs dépendants ne sont pas terminés.",
        updatedAt: now,
      };

      this.goals.set(id, blocked);
      return blocked;
    }

    const updated: Goal = {
      ...goal,
      status,
      blockedReason: undefined,
      updatedAt: now,
    };

    this.goals.set(id, updated);
    return updated;
  }

  private completeGoal(id: string): Goal {
    const goal = this.requireGoal(id);
    const now = new Date().toISOString();

    const updated: Goal = {
      ...goal,
      status: "completed",
      progress: 100,
      currentValue:
        goal.targetValue ??
        goal.currentValue,
      milestones:
        goal.milestones.map(
          (milestone) => ({
            ...milestone,
            completed: true,
            completedAt:
              milestone.completedAt ?? now,
          })
        ),
      completedAt: now,
      updatedAt: now,
      history: [
        ...goal.history,
        {
          id: this.createId("progress"),
          value: 100,
          note: "Objectif terminé",
          createdAt: now,
        },
      ],
    };

    this.goals.set(id, updated);
    return updated;
  }

  private blockGoal(
    id: string,
    reason: string
  ): Goal {
    const goal = this.requireGoal(id);
    const now = new Date().toISOString();

    const updated: Goal = {
      ...goal,
      status: "blocked",
      blockedReason:
        reason.trim() ||
        "Objectif bloqué sans raison précisée.",
      updatedAt: now,
    };

    this.goals.set(id, updated);
    return updated;
  }

  private updateProgress(
    id: string,
    value: number,
    note?: string
  ): Goal {
    const goal = this.requireGoal(id);
    const now = new Date().toISOString();

    const currentValue = Math.max(
      0,
      value
    );

    const progress =
      goal.targetValue !== undefined
        ? this.clamp(
            (currentValue /
              Math.max(
                goal.targetValue,
                1
              )) *
              100,
            0,
            100
          )
        : this.clamp(
            currentValue,
            0,
            100
          );

    const completed =
      progress >= 100;

    const updated: Goal = {
      ...goal,
      currentValue,
      progress,
      status: completed
        ? "completed"
        : goal.status === "draft"
        ? "active"
        : goal.status,
      completedAt: completed
        ? now
        : goal.completedAt,
      updatedAt: now,
      history: [
        ...goal.history,
        {
          id: this.createId("progress"),
          value: progress,
          note,
          createdAt: now,
        },
      ],
    };

    this.goals.set(id, updated);
    return updated;
  }

  private completeMilestone(
    goalId: string,
    milestoneId: string
  ): Goal {
    const goal =
      this.requireGoal(goalId);
    const now = new Date().toISOString();

    const milestones =
      goal.milestones.map(
        (milestone) =>
          milestone.id === milestoneId
            ? {
                ...milestone,
                completed: true,
                completedAt: now,
              }
            : milestone
      );

    const progress =
      this.calculateProgress(
        goal.currentValue ?? 0,
        goal.targetValue,
        milestones
      );

    const completed =
      progress >= 100;

    const updated: Goal = {
      ...goal,
      milestones,
      progress,
      status: completed
        ? "completed"
        : goal.status === "draft"
        ? "active"
        : goal.status,
      completedAt: completed
        ? now
        : goal.completedAt,
      updatedAt: now,
      history: [
        ...goal.history,
        {
          id: this.createId("progress"),
          value: progress,
          note:
            "Étape intermédiaire terminée",
          createdAt: now,
        },
      ],
    };

    this.goals.set(goalId, updated);
    return updated;
  }

  private calculateProgress(
    currentValue: number,
    targetValue:
      | number
      | undefined,
    milestones: GoalMilestone[]
  ): number {
    if (
      targetValue !== undefined &&
      targetValue > 0
    ) {
      return this.clamp(
        (currentValue / targetValue) *
          100,
        0,
        100
      );
    }

    if (milestones.length > 0) {
      const completed =
        milestones.filter(
          (milestone) =>
            milestone.completed
        ).length;

      return this.clamp(
        (completed /
          milestones.length) *
          100,
        0,
        100
      );
    }

    return 0;
  }

  private dependenciesCompleted(
    goal: Goal
  ): boolean {
    return goal.dependencies.every(
      (dependencyId) =>
        this.goals.get(dependencyId)
          ?.status === "completed"
    );
  }

  private requireGoal(id: string): Goal {
    const goal = this.goals.get(id);

    if (!goal) {
      throw new Error(
        `Objectif introuvable : ${id}`
      );
    }

    return goal;
  }

  private createId(
    prefix: string
  ): string {
    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }

  private clamp(
    value: number,
    min: number,
    max: number
  ): number {
    return Math.max(
      min,
      Math.min(max, value)
    );
  }
}
