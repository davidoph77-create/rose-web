import {
  AgentExecutionResult,
  AgentRequest,
  RoseAgent,
} from "../types";

export class BusinessAgent
  implements RoseAgent
{
  readonly id = "business-agent";
  readonly name = "Business Agent";
  readonly version = "1.0.0";
  readonly capabilities = [
    "business",
  ] as const;
  readonly supportedDomains = [
    "business",
  ] as const;
  readonly priority = 92;

  canHandle(
    request: AgentRequest
  ): boolean {
    return (
      request.context.intent ===
        "manage_business" ||
      request.context.domains.includes(
        "business"
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
        capability: "business",
        summary:
          "La demande relève de l’entreprise et doit tenir compte des clients, chantiers, devis ou factures.",
        confidence:
          request.context.confidence,
        data: {
          domain: "business",
        },
        requiresValidation: true,
        createdAt:
          new Date().toISOString(),
      },
    };
  }
}
