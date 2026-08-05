import {
  AgentRegistry,
} from "./AgentRegistry";
import {
  AgentContribution,
  AgentRequest,
  MultiAgentResult,
  RoseAgent,
} from "./types";

export class MultiAgentOrchestrator {
  constructor(
    private readonly registry:
      AgentRegistry
  ) {}

  selectAgents(
    request: AgentRequest
  ): RoseAgent[] {
    return this.registry
      .getAll()
      .filter((agent) =>
        agent.canHandle(request)
      );
  }

  async execute(
    request: AgentRequest
  ): Promise<MultiAgentResult> {
    const selected =
      this.selectAgents(request);

    const settled =
      await Promise.all(
        selected.map(
          async (agent) => {
            try {
              const result =
                await agent.execute(
                  request
                );

              return {
                agent,
                result,
              };
            } catch (error) {
              return {
                agent,
                result: {
                  success: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Erreur inconnue",
                },
              };
            }
          }
        )
      );

    const contributions:
      AgentContribution[] = [];
    const errors: Array<{
      agentId: string;
      message: string;
    }> = [];

    for (const item of settled) {
      if (
        item.result.success &&
        item.result.contribution
      ) {
        contributions.push(
          item.result.contribution
        );
      } else {
        errors.push({
          agentId:
            item.agent.id,
          message:
            item.result.error ??
            "Échec sans précision.",
        });
      }
    }

    return {
      selectedAgentIds:
        selected.map(
          (agent) => agent.id
        ),
      contributions,
      errors,
      consensus:
        this.buildConsensus(
          contributions
        ),
      confidence:
        this.calculateConfidence(
          contributions
        ),
      requiresValidation:
        contributions.some(
          (item) =>
            item.requiresValidation
        ),
    };
  }

  private buildConsensus(
    contributions:
      AgentContribution[]
  ): string {
    if (
      contributions.length === 0
    ) {
      return (
        "Aucun agent spécialisé " +
        "n’a produit de contribution."
      );
    }

    return contributions
      .sort(
        (a, b) =>
          b.confidence -
          a.confidence
      )
      .map(
        (item) =>
          `${item.agentName} : ${item.summary}`
      )
      .join("\n");
  }

  private calculateConfidence(
    contributions:
      AgentContribution[]
  ): number {
    if (
      contributions.length === 0
    ) {
      return 0;
    }

    const average =
      contributions.reduce(
        (total, item) =>
          total +
          item.confidence,
        0
      ) /
      contributions.length;

    return Math.round(
      average * 100
    ) / 100;
  }
}
