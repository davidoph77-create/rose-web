import {
  ModuleStatus,
  RuntimeCommand,
  UnifiedRuntimeModule,
} from "../runtime";
import {
  GoalEngineV3,
} from "./GoalEngineV3";

export class GoalRuntime
  implements UnifiedRuntimeModule
{
  readonly id =
    "v10-goal-runtime";
  readonly name =
    "Rose V10 Goal Engine V3";
  readonly version = "10.0.8";

  private status:
    ModuleStatus = "idle";

  constructor(
    readonly engine:
      GoalEngineV3
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
        "goal."
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
      case "goal.create":
        return this.engine.createGoal({
          title:
            String(
              payload.title ?? ""
            ),
          description:
            typeof payload.description ===
            "string"
              ? payload.description
              : undefined,
        }) as T;

      case "goal.list":
        return this.engine.listGoals() as T;

      case "goal.get":
        return this.engine.getGoal(
          String(
            payload.id ?? ""
          )
        ) as T;

      default:
        throw new Error(
          `Commande Goal Engine V3 inconnue : ${command.name}`
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
