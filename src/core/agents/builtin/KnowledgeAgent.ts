import {
  AgentExecutionResult,
  AgentRequest,
  RoseAgent,
} from "../types";

export class KnowledgeAgent
  implements RoseAgent
{
  readonly id = "knowledge-agent";
  readonly name = "Knowledge Agent";
  readonly version = "1.0.0";
  readonly capabilities = [
    "knowledge",
  ] as const;
  readonly supportedDomains = [
    "general",
    "memory",
    "business",
    "goals",
  ] as const;
  readonly priority = 80;

  canHandle(
    request: AgentRequest
  ): boolean {
    return (
      request.message.trim().length >
        0
    );
  }

  async execute(
    request: AgentRequest
  ): Promise<AgentExecutionResult> {
    const domains =
      request.context.domains.join(
        ", "
      );

    return {
      success: true,
      contribution: {
        agentId: this.id,
        agentName: this.name,
        capability: "knowledge",
        summary:
          `La demande concerne les domaines suivants : ${domains}.`,
        confidence:
          request.context.confidence,
        data: {
          intent:
            request.context.intent,
          domains:
            request.context.domains,
        },
        requiresValidation: false,
        createdAt:
          new Date().toISOString(),
      },
    };
  }
}
