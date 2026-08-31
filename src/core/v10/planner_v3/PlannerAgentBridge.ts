import {
  AgentHandler,
} from "../agents/builtin";
import {
  MemoryEngine,
} from "../memory";
import {
  PlannerEngineV3,
} from "./PlannerEngineV3";

export function createPlannerAgentHandler(
  planner: PlannerEngineV3,
  memory?: MemoryEngine
): AgentHandler {
  return async (
    command
  ) => {
    const payload =
      asRecord(
        command.payload
      );

    switch (
      command.name
    ) {
      case "planner.create":
      case "planning.request":
      case "planner.request": {
        const objective =
          typeof payload.objective ===
          "string"
            ? payload.objective
            : typeof payload.message ===
              "string"
            ? payload.message
            : "";

        if (!objective.trim()) {
          throw new Error(
            "Objectif vide."
          );
        }

        const context =
          memory
            ? {
                memories:
                  memory.search({
                    text:
                      objective,
                    limit: 5,
                  }),
              }
            : {};

        return planner.createPlan({
          objective,
          context,
        });
      }

      case "planner.list":
        return planner.listPlans();

      case "planner.get":
        return planner.getPlan(
          String(
            payload.id ?? ""
          )
        );

      case "planner.step.update":
        return planner.markStep(
          String(
            payload.planId ?? ""
          ),
          String(
            payload.stepId ?? ""
          ),
          String(
            payload.status ??
              "ready"
          ) as any
        );

      default:
        return {
          available: true,
          command:
            command.name,
          message:
            "Commande Planner V3 non reconnue.",
        };
    }
  };
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
