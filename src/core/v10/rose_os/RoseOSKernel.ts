import {
  Runtime,
} from "../runtime";
import {
  AgentManager,
} from "../agents";
import {
  MessageBus,
} from "../communication";
import {
  MemoryEngine,
} from "../memory";
import {
  PlannerEngineV3,
} from "../planner_v3";
import {
  GoalEngineV3,
} from "../goal_v3";
import {
  CognitiveRouter,
} from "../cognitive";
import {
  AutonomyLoopV3,
} from "../autonomy_v3";
import {
  RoseOSDiagnostics,
  RoseOSRequest,
  RoseOSResponse,
  RoseOSStatus,
} from "./RoseOSTypes";

export class RoseOSKernel {
  readonly version = "10.0.10";

  private status:
    RoseOSStatus = "idle";

  constructor(
    readonly runtime: Runtime,
    readonly manager: AgentManager,
    readonly bus: MessageBus,
    readonly memory: MemoryEngine,
    readonly planner: PlannerEngineV3,
    readonly goals: GoalEngineV3,
    readonly cognitive: CognitiveRouter,
    readonly autonomy: AutonomyLoopV3
  ) {}

  async start(): Promise<void> {
    if (
      this.status === "ready" ||
      this.status === "starting"
    ) {
      return;
    }

    this.status = "starting";

    try {
      await this.runtime.start();
      this.status = "ready";
    } catch (error) {
      this.status = "error";
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (
      this.status === "stopped" ||
      this.status === "stopping"
    ) {
      return;
    }

    this.status = "stopping";

    try {
      await this.runtime.stop();
      this.status = "stopped";
    } catch (error) {
      this.status = "error";
      throw error;
    }
  }

  getStatus(): RoseOSStatus {
    return this.status;
  }

  async handle(
    request: RoseOSRequest
  ): Promise<RoseOSResponse> {
    const startedAt =
      new Date().toISOString();

    if (
      this.status !== "ready"
    ) {
      await this.start();
    }

    const autonomyPolicy =
      this.autonomy.getPolicy();

    try {
      if (
        autonomyPolicy.enabled
      ) {
        const result =
          await this.autonomy.run(
            {
              message:
                request.message,
              goalId:
                request.goalId,
              metadata:
                request.metadata,
            },
            request.approvedActionIds ??
              []
          );

        return {
          success:
            result.success,
          status:
            this.status,
          mode:
            "autonomy",
          result,
          startedAt,
          completedAt:
            new Date().toISOString(),
        };
      }

      const result =
        await this.cognitive.route({
          message:
            request.message,
          metadata:
            request.metadata,
        });

      return {
        success:
          result.success,
        status:
          this.status,
        mode:
          "cognitive",
        result,
        startedAt,
        completedAt:
          new Date().toISOString(),
      };
    } catch (error) {
      this.status = "error";

      return {
        success: false,
        status:
          this.status,
        mode:
          "direct",
        result: {
          error:
            error instanceof Error
              ? error.message
              : String(error),
        },
        startedAt,
        completedAt:
          new Date().toISOString(),
      };
    }
  }

  diagnostics():
    RoseOSDiagnostics {
    const runtimeHealth =
      this.runtime.health();

    return {
      status:
        this.status,
      runtimeHealthy:
        runtimeHealth.healthy,
      registeredModules:
        this.runtime
          .getRegistry()
          .getAll()
          .map(
            (module) =>
              module.id
          ),
      registeredAgents:
        this.manager
          .getAgents()
          .map(
            (agent) =>
              agent.id
          ),
      memoryCount:
        this.memory.snapshot()
          .count,
      goalsCount:
        this.goals.listGoals()
          .length,
      plansCount:
        this.planner.listPlans()
          .length,
      generatedAt:
        new Date().toISOString(),
    };
  }
}
