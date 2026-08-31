import {
  ModuleStatus,
  RuntimeCommand,
  UnifiedRuntimeModule,
} from "../runtime";
import {
  PlannerEngineV3,
} from "./PlannerEngineV3";

export class PlannerRuntime
  implements UnifiedRuntimeModule
{
  readonly id =
    "v10-planner-runtime";
  readonly name =
    "Rose V10 Planner Engine V3";
  readonly version = "10.0.7";

  private status:
    ModuleStatus = "idle";

  constructor(
    readonly engine =
      new PlannerEngineV3()
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
        "planner."
      ) ||
      command.name.startsWith(
        "planning."
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
      case "planner.create":
      case "planning.request":
        return this.engine.createPlan({
          objective:
            typeof payload.objective ===
            "string"
              ? payload.objective
              : typeof payload.message ===
                "string"
              ? payload.message
              : "",
          context:
            asRecord(
              payload.context
            ),
        }) as T;

      case "planner.list":
        return this.engine.listPlans() as T;

      case "planner.get":
        return this.engine.getPlan(
          String(
            payload.id ?? ""
          )
        ) as T;

      default:
        throw new Error(
          `Commande Planner V3 inconnue : ${command.name}`
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
