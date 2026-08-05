import {
  AgentExecutionResult,
  AgentRequest,
  RoseAgent,
} from "../types";

export class GoalAgent
  implements RoseAgent
{
  readonly id = "goal-agent";
  readonly name = "Goal Agent";
  readonly version = "1.0.0";
  readonly capabilities = [
    "goals",
  ] as const;
  readonly supportedDomains = [
    "goals",
    "tasks",
    "business",
    "general",
  ] as const;
  readonly priority = 88;

  canHandle(
    request: AgentRequest
  ): boolean {
    return (
      request.context.intent ===
        "manage_goal" ||
      request.context.domains.includes(
        "goals"
      )
    );
  }

  async execute(
    request: AgentRequest
  ): Promise<AgentExecutionResult> {
    return {
      success: true,
      contribution: {
        agentId: this.id,
        agentName: this.name,
        capability: "goals",
        summary:
          "La demande concerne un objectif qui doit être suivi avec progression, jalons et dépendances.",
        confidence:
          request.context.confidence,
        data: {
          recommendedTracking: [
            "progression",
            "jalons",
            "priorité",
            "échéance",
          ],
        },
        requiresValidation: true,
        createdAt:
          new Date().toISOString(),
      },
    };
  }
}
