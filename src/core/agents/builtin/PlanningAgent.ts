import {
  AgentExecutionResult,
  AgentRequest,
  RoseAgent,
} from "../types";

export class PlanningAgent
  implements RoseAgent
{
  readonly id = "planning-agent";
  readonly name = "Planning Agent";
  readonly version = "1.0.0";
  readonly capabilities = [
    "planning",
  ] as const;
  readonly supportedDomains = [
    "tasks",
    "agenda",
    "goals",
    "business",
    "general",
  ] as const;
  readonly priority = 85;

  canHandle(
    request: AgentRequest
  ): boolean {
    return (
      request.context.intent ===
        "plan" ||
      request.context.intent ===
        "schedule" ||
      request.context.domains.includes(
        "tasks"
      ) ||
      request.context.domains.includes(
        "agenda"
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
        capability: "planning",
        summary:
          "La demande peut être transformée en plan ordonné avec validation des étapes importantes.",
        confidence:
          request.context.confidence,
        data: {
          suggestedPhases: [
            "Analyser",
            "Prioriser",
            "Planifier",
            "Valider",
            "Exécuter",
          ],
        },
        requiresValidation: true,
        createdAt:
          new Date().toISOString(),
      },
    };
  }
}
