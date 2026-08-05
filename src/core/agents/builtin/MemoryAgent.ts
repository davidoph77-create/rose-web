import {
  AgentExecutionResult,
  AgentRequest,
  RoseAgent,
} from "../types";

export class MemoryAgent
  implements RoseAgent
{
  readonly id = "memory-agent";
  readonly name = "Memory Agent";
  readonly version = "1.0.0";
  readonly capabilities = [
    "memory",
  ] as const;
  readonly supportedDomains = [
    "memory",
    "general",
  ] as const;
  readonly priority = 90;

  canHandle(
    request: AgentRequest
  ): boolean {
    return (
      request.context.domains.includes(
        "memory"
      ) ||
      request.context.intent ===
        "remember" ||
      Array.isArray(
        request.metadata?.memories
      )
    );
  }

  async execute(
    request: AgentRequest
  ): Promise<AgentExecutionResult> {
    const memories =
      Array.isArray(
        request.metadata?.memories
      )
        ? request.metadata?.memories.filter(
            (value): value is string =>
              typeof value === "string"
          )
        : [];

    return {
      success: true,
      contribution: {
        agentId: this.id,
        agentName: this.name,
        capability: "memory",
        summary:
          memories.length > 0
            ? `${memories.length} souvenir(s) disponible(s) pour enrichir la réponse.`
            : "Aucun souvenir supplémentaire n’a été fourni à cet agent.",
        confidence:
          memories.length > 0
            ? 0.85
            : 0.55,
        data: {
          memories:
            memories.slice(0, 5),
        },
        requiresValidation: false,
        createdAt:
          new Date().toISOString(),
      },
    };
  }
}
