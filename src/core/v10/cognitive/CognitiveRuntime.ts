import {
  AgentManager,
} from "../agents";
import {
  MessageBus,
} from "../communication";
import {
  Runtime,
  RuntimeCommand,
  UnifiedRuntimeModule,
  ModuleStatus,
} from "../runtime";
import {
  CognitiveRouter,
} from "./CognitiveRouter";

export class CognitiveRuntime
  implements UnifiedRuntimeModule
{
  readonly id =
    "v10-cognitive-runtime";
  readonly name =
    "Rose V10 Cognitive Layer";
  readonly version = "10.0.5";

  private status:
    ModuleStatus = "idle";

  private readonly router:
    CognitiveRouter;

  constructor(
    private readonly runtime: Runtime,
    private readonly manager: AgentManager,
    private readonly bus: MessageBus
  ) {
    this.router =
      new CognitiveRouter(
        manager,
        bus
      );
  }

  async initialize() {
    this.status = "ready";
  }

  async start() {
    this.status = "ready";
  }

  async stop() {
    this.status = "stopped";
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
      command.name ===
        "cognitive.route" ||
      command.name ===
        "cognitive.analyze"
    );
  }

  async invoke<T = unknown>(
    command: RuntimeCommand
  ): Promise<T> {
    const payload =
      this.asRecord(
        command.payload
      );

    const message =
      typeof payload.message ===
      "string"
        ? payload.message
        : "";

    if (!message.trim()) {
      throw new Error(
        "Message cognitif vide."
      );
    }

    if (
      command.name ===
      "cognitive.analyze"
    ) {
      return this.router.analyze({
        message,
        metadata:
          this.asRecord(
            payload.metadata
          ),
      }) as T;
    }

    return this.router.route({
      message,
      metadata:
        this.asRecord(
          payload.metadata
        ),
    }) as Promise<T>;
  }

  register(): void {
    if (
      !this.runtime
        .getRegistry()
        .get(this.id)
    ) {
      this.runtime.register(
        this
      );
    }
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
