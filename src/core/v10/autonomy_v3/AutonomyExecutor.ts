import {
  AgentManager,
} from "../agents";
import {
  MessageBus,
} from "../communication";
import {
  AutonomyAction,
} from "./AutonomyTypes";
import {
  AutonomyPolicyManager,
} from "./AutonomyPolicy";

export class AutonomyExecutor {
  constructor(
    private readonly manager:
      AgentManager,
    private readonly bus:
      MessageBus,
    private readonly policy:
      AutonomyPolicyManager
  ) {}

  async execute(
    actions: AutonomyAction[],
    approvedActionIds:
      string[] = []
  ) {
    const executedActions:
      AutonomyAction[] = [];
    const pendingValidation:
      AutonomyAction[] = [];
    const errors: string[] = [];

    for (
      const action of actions
    ) {
      if (
        !this.policy.isActionAllowed(
          action.capability
        )
      ) {
        errors.push(
          `Action refusée par la politique : ${action.description}`
        );
        continue;
      }

      if (
        action.requiresValidation &&
        !approvedActionIds.includes(
          action.id
        )
      ) {
        pendingValidation.push(
          action
        );
        continue;
      }

      try {
        const target =
          action.capability
            ? this.manager
                .getAgents()
                .find(
                  (agent) =>
                    agent.isEnabled() &&
                    agent.capabilities.includes(
                      action.capability!
                    )
                )
            : undefined;

        if (!target) {
          errors.push(
            `Aucun agent disponible pour ${action.capability ?? action.type}.`
          );
          continue;
        }

        const result =
          await this.bus.send({
            sourceAgentId:
              "autonomy-loop",
            target: {
              type: "agent",
              id: target.id,
            },
            type:
              action.type,
            payload:
              action.payload ?? {},
            priority:
              action.requiresValidation
                ? "high"
                : "normal",
          });

        if (
          result.deliveredTo.includes(
            target.id
          )
        ) {
          executedActions.push(
            action
          );
        } else {
          errors.push(
            `Échec de livraison vers ${target.id}.`
          );
        }
      } catch (error) {
        errors.push(
          error instanceof Error
            ? error.message
            : String(error)
        );
      }
    }

    return {
      executedActions,
      pendingValidation,
      errors,
    };
  }
}
