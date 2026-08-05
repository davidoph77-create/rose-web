import {
  CoreContext,
  RoseDomain,
} from "../types/core";

export type AgentCapability =
  | "memory"
  | "knowledge"
  | "planning"
  | "goals"
  | "business"
  | "web"
  | "agenda"
  | "coach"
  | "autonomy"
  | "general";

export type AgentStatus =
  | "idle"
  | "running"
  | "success"
  | "error";

export type AgentRequest = {
  message: string;
  context: CoreContext;
  metadata?: Record<string, unknown>;
};

export type AgentContribution = {
  agentId: string;
  agentName: string;
  capability: AgentCapability;
  summary: string;
  confidence: number;
  data?: unknown;
  requiresValidation: boolean;
  createdAt: string;
};

export type AgentExecutionResult = {
  success: boolean;
  contribution?: AgentContribution;
  error?: string;
};

export interface RoseAgent {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: AgentCapability[];
  readonly supportedDomains: RoseDomain[];
  readonly priority: number;

  canHandle(request: AgentRequest): boolean;
  execute(
    request: AgentRequest
  ): Promise<AgentExecutionResult>;
}

export type AgentSelection = {
  agentIds: string[];
};

export type MultiAgentResult = {
  selectedAgentIds: string[];
  contributions: AgentContribution[];
  errors: Array<{
    agentId: string;
    message: string;
  }>;
  consensus: string;
  confidence: number;
  requiresValidation: boolean;
};
