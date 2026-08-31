import {
  CognitiveRouter,
} from "../cognitive";
import {
  PlannerEngineV3,
} from "../planner_v3";
import {
  AutonomyAction,
  AutonomyCycleInput,
} from "./AutonomyTypes";
import {
  AutonomyPolicyManager,
} from "./AutonomyPolicy";

export class AutonomyPlanner {
  constructor(
    private readonly cognitive:
      CognitiveRouter,
    private readonly planner:
      PlannerEngineV3,
    private readonly policy:
      AutonomyPolicyManager
  ) {}

  analyze(
    input: AutonomyCycleInput
  ) {
    const decision =
      this.cognitive.analyze({
        message:
          input.message,
        metadata:
          input.metadata,
      });

    const plan =
      this.planner.createPlan({
        objective:
          input.message,
        context: {
          goalId:
            input.goalId,
          cognitiveDecision:
            decision,
        },
      });

    const actions:
      AutonomyAction[] =
      plan.plan.steps
        .filter(
          (step) =>
            step.assignedCapability &&
            step.assignedCapability !==
              "planning"
        )
        .map(
          (step) => ({
            id:
              `autonomy-action-${step.id}`,
            type:
              `${step.assignedCapability}.request`,
            capability:
              step.assignedCapability,
            description:
              step.description ??
              step.title,
            requiresValidation:
              step.requiresValidation ||
              this.policy.requiresValidation(
                step.assignedCapability
              ),
            payload: {
              message:
                input.message,
              goalId:
                input.goalId,
              planId:
                plan.plan.id,
              stepId:
                step.id,
            },
          })
        );

    return {
      decision,
      plan,
      actions,
    };
  }
}
