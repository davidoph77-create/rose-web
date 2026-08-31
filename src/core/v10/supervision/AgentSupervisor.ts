import {
  AgentManager,
} from "../agents";
import {
  HeartbeatMonitor,
} from "./HeartbeatMonitor";
import {
  AgentSupervisionState,
  SupervisionReport,
  SupervisorPolicy,
} from "./SupervisionTypes";

export const DEFAULT_SUPERVISOR_POLICY: SupervisorPolicy = {
  heartbeatIntervalMs: 5000,
  heartbeatTimeoutMs: 15000,
  maxMissesBeforeRestart: 2,
  maxRestartAttempts: 3,
  autoRestart: true,
};

export class AgentSupervisor {
  private readonly restartAttempts =
    new Map<string, number>();

  private readonly lastRestartAt =
    new Map<string, string>();

  constructor(
    private readonly manager: AgentManager,
    private readonly heartbeat: HeartbeatMonitor,
    private readonly policy: SupervisorPolicy =
      DEFAULT_SUPERVISOR_POLICY
  ) {}

  async inspect(): Promise<SupervisionReport> {
    const beats = this.heartbeat.checkAll();
    const states: AgentSupervisionState[] = [];

    for (const agent of this.manager.getAgents()) {
      const beat =
        beats.find((item) => item.agentId === agent.id) ?? {
          agentId: agent.id,
          status: "missing" as const,
          consecutiveMisses: 1,
        };

      const agentStatus = agent.getStatus();
      const attempts =
        this.restartAttempts.get(agent.id) ?? 0;

      const unhealthy =
        agentStatus === "error" ||
        beat.consecutiveMisses >=
          this.policy.maxMissesBeforeRestart;

      if (
        unhealthy &&
        this.policy.autoRestart &&
        attempts < this.policy.maxRestartAttempts &&
        agent.isEnabled()
      ) {
        try {
          await agent.restart();

          const nextAttempts = attempts + 1;
          this.restartAttempts.set(
            agent.id,
            nextAttempts
          );

          const restartedAt =
            new Date().toISOString();

          this.lastRestartAt.set(
            agent.id,
            restartedAt
          );

          this.heartbeat.beat(agent.id);
        } catch {
          this.restartAttempts.set(
            agent.id,
            attempts + 1
          );
        }
      }

      const currentBeat =
        this.heartbeat.get(agent.id);

      const currentStatus =
        agent.getStatus();

      states.push({
        agentId: agent.id,
        agentStatus: currentStatus,
        heartbeat: currentBeat,
        restartAttempts:
          this.restartAttempts.get(agent.id) ?? 0,
        lastRestartAt:
          this.lastRestartAt.get(agent.id),
        healthy:
          currentStatus !== "error" &&
          currentBeat.status === "healthy",
      });
    }

    return {
      healthy: states.every((state) => state.healthy),
      agents: states,
      checkedAt: new Date().toISOString(),
    };
  }

  resetAgent(agentId: string): void {
    this.restartAttempts.delete(agentId);
    this.lastRestartAt.delete(agentId);
    this.heartbeat.beat(agentId);
  }
}
