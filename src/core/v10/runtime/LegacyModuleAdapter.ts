import {
  ModuleStatus,
  RuntimeCommand,
  UnifiedRuntimeModule,
} from "./RuntimeTypes";

type LegacyLike = {
  initialize?: () => Promise<void>;
  getStatus?: () => string;
  execute?: (input: unknown) => Promise<unknown>;
};

export class LegacyModuleAdapter
  implements UnifiedRuntimeModule
{
  readonly id: string;
  readonly name: string;
  readonly version: string;

  private status:
    ModuleStatus = "idle";

  constructor(
    id: string,
    name: string,
    version: string,
    private readonly legacy: LegacyLike,
    private readonly commandNames: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.version = version;
  }

  async initialize(): Promise<void> {
    this.status = "starting";
    await this.legacy.initialize?.();
    this.status = "ready";
  }

  async start(): Promise<void> {
    this.status = "ready";
  }

  async stop(): Promise<void> {
    this.status = "stopped";
  }

  getStatus(): ModuleStatus {
    const legacyStatus =
      this.legacy.getStatus?.();

    if (
      legacyStatus === "idle" ||
      legacyStatus === "ready" ||
      legacyStatus === "running" ||
      legacyStatus === "error"
    ) {
      return legacyStatus;
    }

    return this.status;
  }

  canHandle(
    command: RuntimeCommand
  ): boolean {
    return (
      command.target === this.id ||
      this.commandNames.includes(
        command.name
      )
    );
  }

  async invoke<T = unknown>(
    command: RuntimeCommand
  ): Promise<T> {
    if (!this.legacy.execute) {
      throw new Error(
        `Le module legacy ${this.id} ne possède pas execute().`
      );
    }

    this.status = "running";

    try {
      const result =
        await this.legacy.execute(
          command.payload
        );

      this.status = "ready";
      return result as T;
    } catch (error) {
      this.status = "error";
      throw error;
    }
  }
}
