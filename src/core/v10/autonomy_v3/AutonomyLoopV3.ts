import {
  CognitiveRouter,
} from "../cognitive";
import {
  PlannerEngineV3,
} from "../planner_v3";
import {
  MemoryEngine,
} from "../memory";
import {
  GoalEngineV3,
} from "../goal_v3";
import {
  AgentManager,
} from "../agents";
import {
  MessageBus,
} from "../communication";
import {
  AutonomyPlanner,
} from "./AutonomyPlanner";
import {
  AutonomyExecutor,
} from "./AutonomyExecutor";
import {
  AutonomyPolicyManager,
  DEFAULT_AUTONOMY_POLICY,
} from "./AutonomyPolicy";
import {
  AutonomyCycleInput,
  AutonomyCycleResult,
  AutonomyPolicy,
} from "./AutonomyTypes";

export class AutonomyLoopV3 {
  readonly version = "10.0.9";

  private cycle = 0;

  private readonly policy:
    AutonomyPolicyManager;

  private readonly plannerBridge:
    AutonomyPlanner;

  private readonly executor:
    AutonomyExecutor;

  constructor(
    cognitive: CognitiveRouter,
    planner: PlannerEngineV3,
    manager: AgentManager,
    bus: MessageBus,
    private readonly memory?: MemoryEngine,
    private readonly goals?: GoalEngineV3,
    policy:
      AutonomyPolicy =
        DEFAULT_AUTONOMY_POLICY
  ) {
    this.policy =
      new AutonomyPolicyManager(
        policy
      );

    this.plannerBridge =
      new AutonomyPlanner(
        cognitive,
        planner,
        this.policy
      );

    this.executor =
      new AutonomyExecutor(
        manager,
        bus,
        this.policy
      );
  }

  getPolicy() {
    return this.policy.get();
  }

  updatePolicy(
    patch:
      Partial<AutonomyPolicy>
  ) {
    return this.policy.update(
      patch
    );
  }

  async run(
    input:
      AutonomyCycleInput,
    approvedActionIds:
      string[] = []
  ): Promise<
    AutonomyCycleResult
  > {
    const startedAt =
      new Date().toISOString();

    if (
      !this.policy.get()
        .enabled
    ) {
      return {
        success: false,
        state: "blocked",
        cycle:
          this.cycle,
        actions: [],
        executedActions: [],
        pendingValidation: [],
        errors: [
          "Autonomie désactivée.",
        ],
        startedAt,
        completedAt:
          new Date().toISOString(),
      };
    }

    this.cycle += 1;

    if (
      this.cycle >
      this.policy.get()
        .maxCycles
    ) {
      return {
        success: false,
        state: "blocked",
        cycle:
          this.cycle,
        actions: [],
        executedActions: [],
        pendingValidation: [],
        errors: [
          "Nombre maximal de cycles atteint.",
        ],
        startedAt,
        completedAt:
          new Date().toISOString(),
      };
    }

    try {
      const prepared =
        this.plannerBridge.analyze(
          input
        );

      const execution =
        await this.executor.execute(
          prepared.actions,
          approvedActionIds
        );

      if (
        this.memory &&
        this.policy.get()
          .allowMemoryWrites
      ) {
        this.memory.remember({
          kind:
            "decision",
          title:
            `Autonomy cycle ${this.cycle}`,
          content: {
            input:
              input.message,
            decision:
              prepared.decision,
            planId:
              prepared.plan.plan.id,
            executedActions:
              execution.executedActions.map(
                (action) =>
                  action.type
              ),
          },
          tags: [
            "autonomy",
            "v10",
          ],
          importance:
            "normal",
          confidence:
            0.9,
        });
      }

      if (
        input.goalId &&
        this.goals &&
        this.policy.get()
          .allowGoalProgressUpdates &&
        execution.executedActions
          .length > 0
      ) {
        const goal =
          this.goals.getGoal(
            input.goalId
          );

        if (goal) {
          this.goals.updateProgress(
            goal.id,
            Math.min(
              goal.progress
                .completedSteps +
                execution.executedActions
                  .length,
              goal.progress
                .totalSteps ||
                execution.executedActions
                  .length
            ),
            goal.progress
              .totalSteps ||
              execution.executedActions
                .length
          );
        }
      }

      const state =
        execution
          .pendingValidation
          .length > 0
          ? "waiting_validation"
          : execution.errors
              .length > 0
          ? "blocked"
          : "completed";

      return {
        success:
          execution.errors
            .length === 0,
        state,
        cycle:
          this.cycle,
        decision:
          prepared.decision,
        plan:
          prepared.plan,
        actions:
          prepared.actions,
        executedActions:
          execution.executedActions,
        pendingValidation:
          execution.pendingValidation,
        errors:
          execution.errors,
        startedAt,
        completedAt:
          new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        state: "error",
        cycle:
          this.cycle,
        actions: [],
        executedActions: [],
        pendingValidation: [],
        errors: [
          error instanceof Error
            ? error.message
            : String(error),
        ],
        startedAt,
        completedAt:
          new Date().toISOString(),
      };
    }
  }

  resetCycles() {
    this.cycle = 0;
  }
}
