import {
  ModuleStatus,
  RuntimeCommand,
  UnifiedRuntimeModule,
} from "../runtime";
import {
  AutonomyLoopV3,
} from "./AutonomyLoopV3";

export class AutonomyRuntime
  implements UnifiedRuntimeModule
{
  readonly id =
    "v10-autonomy-runtime";
  readonly name =
    "Rose V10 Autonomy Loop V3";
  readonly version = "10.0.9";

  private status:
    ModuleStatus = "idle";

  constructor(
    readonly loop:
      AutonomyLoopV3
  ) {}

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
      command.target ===
        this.id ||
      command.name.startsWith(
        "autonomy."
      )
    );
  }

  async invoke<T = unknown>(
    command: RuntimeCommand
  ): Promise<T> {
    const payload =
      asRecord(
        command.payload
      );

    switch (
      command.name
    ) {
      case "autonomy.run":
        return this.loop.run(
          {
            message:
              String(
                payload.message ??
                  ""
              ),
            goalId:
              typeof payload.goalId ===
              "string"
                ? payload.goalId
                : undefined,
            metadata:
              asRecord(
                payload.metadata
              ),
          },
          Array.isArray(
            payload.approvedActionIds
          )
            ? payload
                .approvedActionIds
                .filter(
                  (item) =>
                    typeof item ===
                    "string"
                )
            : []
        ) as Promise<T>;

      case "autonomy.policy.get":
        return this.loop.getPolicy() as T;

      case "autonomy.policy.update":
        return this.loop.updatePolicy(
          asRecord(
            payload.patch
          )
        ) as T;

      case "autonomy.reset":
        this.loop.resetCycles();
        return {
          success: true,
        } as T;

      default:
        throw new Error(
          `Commande autonomie inconnue : ${command.name}`
        );
    }
  }
}

function asRecord(
  value: unknown
): Record<string, any> {
  if (
    value &&
    typeof value ===
      "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      any
    >;
  }

  return {};
}
