import {
  ModuleStatus,
  RuntimeCommand,
  UnifiedRuntimeModule,
} from "../runtime";
import {
  RoseOSKernel,
} from "./RoseOSKernel";

export class RoseOSRuntimeModule
  implements UnifiedRuntimeModule
{
  readonly id =
    "v10-rose-os";
  readonly name =
    "Rose OS V10";
  readonly version = "10.0.10";

  private status:
    ModuleStatus = "idle";

  constructor(
    private readonly kernel:
      RoseOSKernel
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
      command.target === this.id ||
      command.name.startsWith(
        "roseos."
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
      case "roseos.handle":
        return this.kernel.handle({
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
          approvedActionIds:
            Array.isArray(
              payload.approvedActionIds
            )
              ? payload.approvedActionIds.filter(
                  (item) =>
                    typeof item ===
                    "string"
                )
              : [],
        }) as Promise<T>;

      case "roseos.diagnostics":
        return this.kernel.diagnostics() as T;

      default:
        throw new Error(
          `Commande Rose OS inconnue : ${command.name}`
        );
    }
  }
}

function asRecord(
  value: unknown
): Record<string, any> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      any
    >;
  }

  return {};
}
