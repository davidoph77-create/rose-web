import {
  CoreContext,
  CoreModule,
  CoreStatus,
  RoseDomain,
} from "../types/core";

export type AgentSelection = {
  agentIds: string[];
};

const DOMAIN_TO_AGENT: Partial<Record<RoseDomain, string>> = {
  memory: "memory-agent",
  goals: "goal-agent",
  tasks: "task-agent",
  web: "web-agent",
  agenda: "calendar-agent",
  business: "business-agent",
  coach: "coach-agent",
  autonomy: "autonomy-agent",
};

export class AgentManager
  implements CoreModule<CoreContext, AgentSelection>
{
  readonly id = "agent-manager";
  readonly name = "Agent Manager";
  readonly version = "1.0.0";
  readonly maturity = 1 as const;

  private status: CoreStatus = "idle";

  getStatus(): CoreStatus {
    return this.status;
  }

  async initialize(): Promise<void> {
    this.status = "initializing";
    this.status = "ready";
  }

  async execute(context: CoreContext): Promise<AgentSelection> {
    this.status = "running";

    try {
      const agentIds = context.domains
        .map((domain) => DOMAIN_TO_AGENT[domain])
        .filter((id): id is string => Boolean(id));

      return {
        agentIds: Array.from(new Set(agentIds)),
      };
    } finally {
      this.status = "ready";
    }
  }
}
