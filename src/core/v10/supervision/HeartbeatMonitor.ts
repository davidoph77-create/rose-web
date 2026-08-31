import {
  AgentManager,
} from "../agents";
import {
  AgentHeartbeatRecord,
  SupervisorPolicy,
} from "./SupervisionTypes";

export class HeartbeatMonitor {
  private readonly beats =
    new Map<string, AgentHeartbeatRecord>();

  constructor(
    private readonly manager: AgentManager,
    private readonly policy: SupervisorPolicy
  ) {}

  beat(agentId: string): AgentHeartbeatRecord {
    const record: AgentHeartbeatRecord = {
      agentId,
      lastBeatAt: new Date().toISOString(),
      status: "healthy",
      consecutiveMisses: 0,
    };

    this.beats.set(agentId, record);
    return { ...record };
  }

  get(agentId: string): AgentHeartbeatRecord {
    const current = this.beats.get(agentId);

    if (!current) {
      return {
        agentId,
        status: "missing",
        consecutiveMisses: 0,
      };
    }

    return { ...current };
  }

  checkAll(): AgentHeartbeatRecord[] {
    const now = Date.now();

    return this.manager.getAgents().map((agent) => {
      const current = this.beats.get(agent.id);

      if (!current?.lastBeatAt) {
        const missing: AgentHeartbeatRecord = {
          agentId: agent.id,
          status: "missing",
          consecutiveMisses:
            (current?.consecutiveMisses ?? 0) + 1,
        };

        this.beats.set(agent.id, missing);
        return { ...missing };
      }

      const age =
        now - new Date(current.lastBeatAt).getTime();

      const missed =
        age > this.policy.heartbeatTimeoutMs;

      const updated: AgentHeartbeatRecord = {
        ...current,
        status: missed ? "late" : "healthy",
        consecutiveMisses: missed
          ? current.consecutiveMisses + 1
          : 0,
      };

      this.beats.set(agent.id, updated);
      return { ...updated };
    });
  }

  clear(): void {
    this.beats.clear();
  }
}
