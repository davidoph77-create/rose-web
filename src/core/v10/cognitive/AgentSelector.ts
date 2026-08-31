import {
  AgentManager,
  RoseAgent,
} from "../agents";
import {
  CognitiveDecision,
} from "./CognitiveTypes";

export class AgentSelector {
  constructor(
    private readonly manager: AgentManager
  ) {}

  select(
    decision: CognitiveDecision
  ): RoseAgent[] {
    const capabilities =
      new Set(
        decision.selectedCapabilities
      );

    const candidates =
      this.manager
        .getAgents()
        .filter(
          (agent) =>
            agent.isEnabled() &&
            agent.capabilities.some(
              (capability) =>
                capabilities.has(
                  capability
                )
            )
        );

    const rank = {
      critical: 4,
      high: 3,
      normal: 2,
      low: 1,
    };

    return candidates.sort(
      (a, b) =>
        rank[b.priority] -
        rank[a.priority]
    );
  }
}
