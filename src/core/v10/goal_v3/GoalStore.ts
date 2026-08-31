import {
  Goal,
} from "./GoalTypes";

export class GoalStore {
  private readonly goals =
    new Map<string, Goal>();

  save(goal: Goal): Goal {
    const clone = {
      ...goal,
      tags: [...goal.tags],
      progress: {
        ...goal.progress,
      },
    };

    this.goals.set(
      goal.id,
      clone
    );

    return this.get(goal.id)!;
  }

  get(id: string):
    | Goal
    | undefined {
    const goal =
      this.goals.get(id);

    if (!goal) {
      return undefined;
    }

    return {
      ...goal,
      tags: [...goal.tags],
      progress: {
        ...goal.progress,
      },
    };
  }

  all(): Goal[] {
    return Array.from(
      this.goals.values()
    ).map(
      (goal) => ({
        ...goal,
        tags: [...goal.tags],
        progress: {
          ...goal.progress,
        },
      })
    );
  }

  delete(id: string): boolean {
    return this.goals.delete(id);
  }
}
