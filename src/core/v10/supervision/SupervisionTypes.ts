import {
  AgentStatus,
} from "../agents";

export type HeartbeatStatus =
  | "healthy"
  | "late"
  | "missing"
  | "error";

export type AgentHeartbeatRecord = {
  agentId: string;
  lastBeatAt?: string;
  status: HeartbeatStatus;
  consecutiveMisses: number;
};

export type SupervisorPolicy = {
  heartbeatIntervalMs: number;
  heartbeatTimeoutMs: number;
  maxMissesBeforeRestart: number;
  maxRestartAttempts: number;
  autoRestart: boolean;
};

export type AgentSupervisionState = {
  agentId: string;
  agentStatus: AgentStatus;
  heartbeat: AgentHeartbeatRecord;
  restartAttempts: number;
  lastRestartAt?: string;
  healthy: boolean;
};

export type SupervisionReport = {
  healthy: boolean;
  agents: AgentSupervisionState[];
  checkedAt: string;
};

export type SchedulerPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

export type ScheduledAgentTask<T = unknown> = {
  id: string;
  agentId: string;
  commandName: string;
  payload?: T;
  priority: SchedulerPriority;
  createdAt: string;
};
