import {
  RuntimeCommand,
} from "../runtime";
import {
  RoseAgent,
} from "./AgentTypes";

export class AgentRegistry {
  private readonly agents =
    new Map<string, RoseAgent>();

  register(agent: RoseAgent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(
        `Agent déjà enregistré : ${agent.id}`
      );
    }

    this.agents.set(
      agent.id,
      agent
    );
  }

  replace(agent: RoseAgent): void {
    this.agents.set(
      agent.id,
      agent
    );
  }

  unregister(id: string): boolean {
    return this.agents.delete(id);
  }

  get(id: string):
    | RoseAgent
    | undefined {
    return this.agents.get(id);
  }

  getAll(): RoseAgent[] {
    return Array.from(
      this.agents.values()
    );
  }

  getEnabled(): RoseAgent[] {
    return this.getAll().filter(
      (agent) => agent.isEnabled()
    );
  }

  findHandlers(
    command: RuntimeCommand
  ): RoseAgent[] {
    return this.getEnabled()
      .filter(
        (agent) =>
          agent.canHandle(command)
      )
      .sort((a, b) => {
        const rank = {
          critical: 4,
          high: 3,
          normal: 2,
          low: 1,
        };

        return (
          rank[b.priority] -
          rank[a.priority]
        );
      });
  }

  size(): number {
    return this.agents.size;
  }

  clear(): void {
    this.agents.clear();
  }
}
