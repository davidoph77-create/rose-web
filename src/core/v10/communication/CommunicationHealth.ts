import {
  AgentManager,
} from "../agents";
import {
  MessageBus,
} from "./MessageBus";

export class CommunicationHealth {
  constructor(
    private readonly bus:
      MessageBus,
    private readonly manager:
      AgentManager
  ) {}

  check() {
    const agents =
      this.manager.getAgents();

    const enabled =
      agents.filter(
        (agent) =>
          agent.isEnabled()
      );

    const errored =
      enabled.filter(
        (agent) =>
          agent.getStatus() ===
          "error"
      );

    return {
      healthy:
        errored.length === 0,
      agentCount:
        agents.length,
      enabledAgentCount:
        enabled.length,
      erroredAgentIds:
        errored.map(
          (agent) =>
            agent.id
        ),
      pendingMessages:
        this.bus.pending()
          .length,
      eventSubscriptions:
        this.bus
          .getEvents()
          .count(),
      checkedAt:
        new Date().toISOString(),
    };
  }
}
