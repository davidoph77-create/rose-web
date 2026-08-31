import {
  RuntimeCommand,
} from "../runtime";
import {
  AgentContextValue,
  AgentDescriptor,
  AgentExecutionInput,
  AgentExecutionResult,
  AgentPriority,
  RoseAgent,
} from "./AgentTypes";
import {
  AgentState,
} from "./AgentState";

export abstract class BaseAgent
  implements RoseAgent
{
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly priority: AgentPriority;
  abstract readonly capabilities: string[];

  protected readonly state =
    new AgentState();

  async initialize(): Promise<void> {
    if (!this.state.isEnabled()) {
      this.state.setStatus("stopped");
      return;
    }

    this.state.setStatus("starting");
    await this.onInitialize();
    this.state.setStatus("ready");
  }

  async start(): Promise<void> {
    if (!this.state.isEnabled()) {
      return;
    }

    this.state.setStatus("starting");
    await this.onStart();
    this.state.setStatus("ready");
  }

  async stop(): Promise<void> {
    await this.onStop();
    this.state.setStatus("stopped");
  }

  async pause(): Promise<void> {
    await this.onPause();
    this.state.setStatus("paused");
  }

  async resume(): Promise<void> {
    if (!this.state.isEnabled()) {
      return;
    }

    await this.onResume();
    this.state.setStatus("ready");
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  getStatus() {
    return this.state.getStatus();
  }

  isEnabled(): boolean {
    return this.state.isEnabled();
  }

  setEnabled(enabled: boolean): void {
    this.state.setEnabled(enabled);

    if (!enabled) {
      this.state.setStatus("stopped");
    } else if (
      this.state.getStatus() === "stopped"
    ) {
      this.state.setStatus("idle");
    }
  }

  abstract canHandle(
    command: RuntimeCommand
  ): boolean;

  async execute<T = unknown>(
    input: AgentExecutionInput
  ): Promise<AgentExecutionResult<T>> {
    const startedAt =
      new Date().toISOString();

    if (!this.state.isEnabled()) {
      return {
        success: false,
        agentId: this.id,
        error: "Agent désactivé.",
        startedAt,
        completedAt:
          new Date().toISOString(),
      };
    }

    this.state.setStatus("running");
    this.state.recordRun();

    try {
      const data =
        await this.handle<T>(
          input.command,
          input.context
        );

      this.state.setStatus("ready");

      return {
        success: true,
        agentId: this.id,
        data,
        startedAt,
        completedAt:
          new Date().toISOString(),
      };
    } catch (error) {
      this.state.recordError(error);
      this.state.setStatus("error");

      return {
        success: false,
        agentId: this.id,
        error:
          error instanceof Error
            ? error.message
            : String(error),
        startedAt,
        completedAt:
          new Date().toISOString(),
      };
    }
  }

  describe(): AgentDescriptor {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      priority: this.priority,
      capabilities: [
        ...this.capabilities,
      ],
      status: this.getStatus(),
      enabled: this.isEnabled(),
    };
  }

  protected async onInitialize():
    Promise<void> {}

  protected async onStart():
    Promise<void> {}

  protected async onStop():
    Promise<void> {}

  protected async onPause():
    Promise<void> {}

  protected async onResume():
    Promise<void> {}

  protected abstract handle<T = unknown>(
    command: RuntimeCommand,
    context: AgentContextValue
  ): Promise<T>;
}
