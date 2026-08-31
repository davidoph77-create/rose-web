import {
  ModuleStatus,
  RuntimeCommand,
  UnifiedRuntimeModule,
} from "../runtime";
import {
  AgentContext,
} from "./AgentContext";
import {
  AgentRegistry,
} from "./AgentRegistry";
import {
  AgentExecutionResult,
  RoseAgent,
} from "./AgentTypes";

export type AgentManagerCommand =
  | "agent.list"
  | "agent.describe"
  | "agent.enable"
  | "agent.disable"
  | "agent.restart"
  | "agent.execute";

export class AgentManager
  implements UnifiedRuntimeModule
{
  readonly id =
    "v10-agent-manager";
  readonly name =
    "Rose V10 Agent Manager";
  readonly version = "10.0.4A";

  private status:
    ModuleStatus = "idle";

  private readonly registry =
    new AgentRegistry();

  private readonly context =
    new AgentContext();

  async initialize():
    Promise<void> {
    this.status = "starting";

    for (
      const agent of this.registry.getAll()
    ) {
      await agent.initialize();
    }

    this.status = "ready";
  }

  async start():
    Promise<void> {
    this.status = "starting";

    for (
      const agent of this.registry.getAll()
    ) {
      await agent.start();
    }

    this.status = "ready";
  }

  async stop():
    Promise<void> {
    const agents =
      [...this.registry.getAll()]
        .reverse();

    for (
      const agent of agents
    ) {
      await agent.stop();
    }

    this.status = "stopped";
  }

  async pause():
    Promise<void> {
    for (
      const agent of this.registry.getAll()
    ) {
      await agent.pause();
    }

    this.status = "paused";
  }

  async resume():
    Promise<void> {
    for (
      const agent of this.registry.getAll()
    ) {
      await agent.resume();
    }

    this.status = "ready";
  }

  getStatus():
    ModuleStatus {
    return this.status;
  }

  canHandle(
    command: RuntimeCommand
  ): boolean {
    return (
      command.target === this.id ||
      command.name.startsWith(
        "agent."
      )
    );
  }

  async invoke<T = unknown>(
    command: RuntimeCommand
  ): Promise<T> {
    switch (
      command.name as AgentManagerCommand
    ) {
      case "agent.list":
        return this.registry
          .getAll()
          .map(
            (agent) =>
              agent.describe()
          ) as T;

      case "agent.describe": {
        const id =
          this.readAgentId(
            command.payload
          );

        const agent =
          this.requireAgent(id);

        return agent.describe() as T;
      }

      case "agent.enable": {
        const id =
          this.readAgentId(
            command.payload
          );

        const agent =
          this.requireAgent(id);

        agent.setEnabled(true);
        await agent.start();

        return agent.describe() as T;
      }

      case "agent.disable": {
        const id =
          this.readAgentId(
            command.payload
          );

        const agent =
          this.requireAgent(id);

        await agent.stop();
        agent.setEnabled(false);

        return agent.describe() as T;
      }

      case "agent.restart": {
        const id =
          this.readAgentId(
            command.payload
          );

        const agent =
          this.requireAgent(id);

        await agent.restart();

        return agent.describe() as T;
      }

      case "agent.execute":
        return (
          await this.executeAgent(
            command
          )
        ) as T;

      default:
        throw new Error(
          `Commande AgentManager inconnue : ${command.name}`
        );
    }
  }

  register(
    agent: RoseAgent
  ): void {
    this.registry.register(agent);
  }

  unregister(
    agentId: string
  ): boolean {
    return this.registry.unregister(
      agentId
    );
  }

  getAgent(
    agentId: string
  ) {
    return this.registry.get(
      agentId
    );
  }

  getAgents() {
    return this.registry.getAll();
  }

  setContext(
    value: Parameters<
      AgentContext["set"]
    >[0]
  ) {
    return this.context.set(
      value
    );
  }

  private async executeAgent(
    command: RuntimeCommand
  ): Promise<
    AgentExecutionResult | AgentExecutionResult[]
  > {
    const payload =
      this.asRecord(
        command.payload
      );

    const explicitAgentId =
      typeof payload.agentId ===
      "string"
        ? payload.agentId
        : undefined;

    const innerCommand:
      RuntimeCommand = {
      id:
        typeof payload.commandId ===
        "string"
          ? payload.commandId
          : undefined,
      name:
        typeof payload.commandName ===
        "string"
          ? payload.commandName
          : "agent.task",
      payload:
        payload.payload,
      metadata:
        command.metadata,
    };

    const handlers =
      explicitAgentId
        ? [
            this.requireAgent(
              explicitAgentId
            ),
          ]
        : this.registry
            .findHandlers(
              innerCommand
            );

    if (
      handlers.length === 0
    ) {
      throw new Error(
        `Aucun agent ne peut traiter : ${innerCommand.name}`
      );
    }

    const context =
      this.context.get();

    const results =
      await Promise.all(
        handlers.map(
          (agent) =>
            agent.execute({
              command:
                innerCommand,
              context,
            })
        )
      );

    return results.length === 1
      ? results[0]
      : results;
  }

  private requireAgent(
    id: string
  ): RoseAgent {
    const agent =
      this.registry.get(id);

    if (!agent) {
      throw new Error(
        `Agent introuvable : ${id}`
      );
    }

    return agent;
  }

  private readAgentId(
    payload: unknown
  ): string {
    const record =
      this.asRecord(payload);

    if (
      typeof record.agentId !==
      "string" ||
      !record.agentId.trim()
    ) {
      throw new Error(
        "agentId manquant."
      );
    }

    return record.agentId;
  }

  private asRecord(
    value: unknown
  ): Record<
    string,
    unknown
  > {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      return value as Record<
        string,
        unknown
      >;
    }

    return {};
  }
}
