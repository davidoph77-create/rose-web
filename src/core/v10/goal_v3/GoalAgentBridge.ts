import {
  AgentHandler,
} from "../agents/builtin";
import {
  GoalEngineV3,
} from "./GoalEngineV3";

export function createGoalAgentHandler(
  engine: GoalEngineV3
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
      case "goal.create":
      case "goal.request":
        return engine.createGoal({
          title:
            typeof payload.title ===
            "string"
              ? payload.title
              : typeof payload.message ===
                "string"
              ? payload.message
              : "",
          description:
            typeof payload.description ===
            "string"
              ? payload.description
              : undefined,
          priority:
            payload.priority ===
              "critical" ||
            payload.priority ===
              "high" ||
            payload.priority ===
              "low"
              ? payload.priority
              : "normal",
          targetDate:
            typeof payload.targetDate ===
            "string"
              ? payload.targetDate
              : undefined,
          tags:
            Array.isArray(
              payload.tags
            )
              ? payload.tags.filter(
                  (item) =>
                    typeof item ===
                    "string"
                )
              : [],
          metadata:
            asRecord(
              payload.metadata
            ),
        });

      case "goal.list":
        return engine.listGoals();

      case "goal.get":
        return engine.getGoal(
          String(
            payload.id ?? ""
          )
        );

      case "goal.status":
        return engine.setStatus(
          String(
            payload.id ?? ""
          ),
          String(
            payload.status ??
              "active"
          ) as any
        );

      case "goal.progress":
        return engine.updateProgress(
          String(
            payload.id ?? ""
          ),
          Number(
            payload.completedSteps ??
              0
          ),
          typeof payload.totalSteps ===
          "number"
            ? payload.totalSteps
            : undefined
        );

      default:
        return {
          available: true,
          command:
            command.name,
          message:
            "Commande Goal Engine V3 non reconnue.",
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
