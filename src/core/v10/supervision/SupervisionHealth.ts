import {
  AgentSupervisor,
} from "./AgentSupervisor";

export class SupervisionHealth {
  constructor(
    private readonly supervisor: AgentSupervisor
  ) {}

  async check() {
    const report =
      await this.supervisor.inspect();

    return {
      healthy: report.healthy,
      totalAgents:
        report.agents.length,
      unhealthyAgents:
        report.agents
          .filter((agent) => !agent.healthy)
          .map((agent) => agent.agentId),
      report,
    };
  }
}
