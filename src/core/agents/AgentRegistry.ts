import {
  RoseAgent,
} from "./types";

export class AgentRegistry {
  private readonly agents =
    new Map<string, RoseAgent>();

  register(agent: RoseAgent): void {
    this.agents.set(agent.id, agent);
  }

  unregister(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  get(agentId: string):
    | RoseAgent
    | undefined {
    return this.agents.get(agentId);
  }

  getAll(): RoseAgent[] {
    return Array.from(
      this.agents.values()
    ).sort(
      (a, b) =>
        b.priority - a.priority
    );
  }

  clear(): void {
    this.agents.clear();
  }
}
