import {
  CoreContext,
  CoreModule,
  CoreStatus,
} from "../types/core";
import {
  EventBus,
} from "../events/EventBus";
import {
  AgentRegistry,
} from "./AgentRegistry";
import {
  MultiAgentOrchestrator,
} from "./MultiAgentOrchestrator";
import {
  BusinessAgent,
  GoalAgent,
  KnowledgeAgent,
  MemoryAgent,
  PlanningAgent,
} from "./builtin";
import {
  AgentRequest,
  AgentSelection,
  MultiAgentResult,
  RoseAgent,
} from "./types";

export class AgentManager
  implements
    CoreModule<
      CoreContext,
      AgentSelection
    >
{
  readonly id = "agent-manager";
  readonly name = "Agent Manager";
  readonly version = "2.0.0";
  readonly maturity = 2 as const;

  private status:
    CoreStatus = "idle";

  private readonly registry =
    new AgentRegistry();

  private readonly orchestrator =
    new MultiAgentOrchestrator(
      this.registry
    );

  constructor(
    private readonly eventBus?:
      EventBus
  ) {
    this.registerDefaultAgents();
  }

  getStatus(): CoreStatus {
    return this.status;
  }

  async initialize():
    Promise<void> {
    this.status =
      "initializing";
    this.status = "ready";
  }

  async execute(
    context: CoreContext
  ): Promise<AgentSelection> {
    const request:
      AgentRequest = {
      message: context.message,
      context,
      metadata:
        context.metadata,
    };

    return {
      agentIds:
        this.orchestrator
          .selectAgents(request)
          .map(
            (agent) =>
              agent.id
          ),
    };
  }

  async run(
    request: AgentRequest
  ): Promise<MultiAgentResult> {
    this.status = "running";

    try {
      const selected =
        this.orchestrator
          .selectAgents(request);

      await this.eventBus?.publish(
        "agents.selected",
        {
          agentIds:
            selected.map(
              (agent) =>
                agent.id
            ),
        },
        this.id
      );

      const result =
        await this.orchestrator.execute(
          request
        );

      for (
        const contribution
        of result.contributions
      ) {
        await this.eventBus?.publish(
          "agent.contribution.ready",
          contribution,
          contribution.agentId
        );
      }

      await this.eventBus?.publish(
        "agents.consensus.ready",
        {
          consensus:
            result.consensus,
          confidence:
            result.confidence,
          requiresValidation:
            result.requiresValidation,
        },
        this.id
      );

      return result;
    } finally {
      this.status = "ready";
    }
  }

  register(
    agent: RoseAgent
  ): void {
    this.registry.register(
      agent
    );
  }

  unregister(
    agentId: string
  ): boolean {
    return this.registry.unregister(
      agentId
    );
  }

  getAgents(): RoseAgent[] {
    return this.registry.getAll();
  }

  private registerDefaultAgents():
    void {
    this.registry.register(
      new MemoryAgent()
    );
    this.registry.register(
      new KnowledgeAgent()
    );
    this.registry.register(
      new PlanningAgent()
    );
    this.registry.register(
      new GoalAgent()
    );
    this.registry.register(
      new BusinessAgent()
    );
  }
}
