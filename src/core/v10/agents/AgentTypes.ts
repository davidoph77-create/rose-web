import {
  ModuleStatus,
  RuntimeCommand,
} from "../runtime";

export type AgentStatus = ModuleStatus;

export type AgentPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

export type AgentCapability =
  | "memory"
  | "planning"
  | "calendar"
  | "business"
  | "web"
  | "voice"
  | "vision"
  | "learning"
  | "general"
  | string;

export type AgentContextValue = {
  userId?: string;
  sessionId?: string;
  locale?: string;
  metadata: Record<string, unknown>;
};

export type AgentExecutionInput<T = unknown> = {
  command: RuntimeCommand<T>;
  context: AgentContextValue;
};

export type AgentExecutionResult<T = unknown> = {
  success: boolean;
  agentId: string;
  data?: T;
  error?: string;
  startedAt: string;
  completedAt: string;
};

export type AgentDescriptor = {
  id: string;
  name: string;
  version: string;
  priority: AgentPriority;
  capabilities: AgentCapability[];
  status: AgentStatus;
  enabled: boolean;
};

export interface RoseAgent {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly priority: AgentPriority;
  readonly capabilities: AgentCapability[];

  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  restart(): Promise<void>;

  getStatus(): AgentStatus;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;

  canHandle(command: RuntimeCommand): boolean;

  execute<T = unknown>(
    input: AgentExecutionInput
  ): Promise<AgentExecutionResult<T>>;

  describe(): AgentDescriptor;
}
