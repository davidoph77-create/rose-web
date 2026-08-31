import {
  AgentManager,
} from "../agents";
import {
  ScheduledAgentTask,
  SchedulerPriority,
} from "./SupervisionTypes";

const PRIORITY_SCORE: Record<
  SchedulerPriority,
  number
> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

export class AgentScheduler {
  private readonly queue:
    ScheduledAgentTask[] = [];

  constructor(
    private readonly manager: AgentManager
  ) {}

  schedule<T = unknown>(
    task: Omit<
      ScheduledAgentTask<T>,
      "id" | "createdAt"
    >
  ): ScheduledAgentTask<T> {
    const full: ScheduledAgentTask<T> = {
      ...task,
      id:
        `agent-task-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    this.queue.push(
      full as ScheduledAgentTask
    );

    this.queue.sort((a, b) => {
      const priority =
        PRIORITY_SCORE[b.priority] -
        PRIORITY_SCORE[a.priority];

      if (priority !== 0) {
        return priority;
      }

      return (
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
      );
    });

    return full;
  }

  pending(): ScheduledAgentTask[] {
    return [...this.queue];
  }

  async runNext() {
    const task =
      this.queue.shift();

    if (!task) {
      return undefined;
    }

    const agent =
      this.manager.getAgent(
        task.agentId
      );

    if (!agent) {
      return {
        success: false,
        agentId: task.agentId,
        error: "Agent introuvable.",
      };
    }

    return agent.execute({
      command: {
        name: task.commandName,
        payload: task.payload,
      },
      context:
        this.manager.setContext({}),
    });
  }

  async flush() {
    const results: unknown[] = [];

    while (this.queue.length > 0) {
      results.push(
        await this.runNext()
      );
    }

    return results;
  }

  clear(): void {
    this.queue.length = 0;
  }
}
