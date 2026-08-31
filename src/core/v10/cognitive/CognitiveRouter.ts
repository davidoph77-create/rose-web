import {
  AgentManager,
} from "../agents";
import {
  MessageBus,
} from "../communication";
import {
  CognitiveDecision,
  CognitiveInput,
} from "./CognitiveTypes";
import {
  AgentSelector,
} from "./AgentSelector";
import {
  IntentClassifier,
} from "./IntentClassifier";

export class CognitiveRouter {
  private readonly classifier =
    new IntentClassifier();

  private readonly selector:
    AgentSelector;

  constructor(
    private readonly manager: AgentManager,
    private readonly bus: MessageBus
  ) {
    this.selector =
      new AgentSelector(
        manager
      );
  }

  analyze(
    input: CognitiveInput
  ): CognitiveDecision {
    return this.classifier.classify(
      input
    );
  }

  async route(
    input: CognitiveInput
  ) {
    const decision =
      this.analyze(input);

    const agents =
      this.selector.select(
        decision
      );

    const results: unknown[] = [];

    for (const agent of agents) {
      const delivery =
        await this.bus.send({
          sourceAgentId:
            "cognitive-layer",
          target: {
            type: "agent",
            id: agent.id,
          },
          type:
            `${decision.intent}.request`,
          payload: {
            message: input.message,
            metadata:
              input.metadata ?? {},
            cognitiveDecision:
              decision,
          },
          priority:
            decision.confidence >= 0.85
              ? "high"
              : "normal",
        });

      results.push(delivery);
    }

    return {
      success:
        agents.length === 0
          ? decision.intent === "general"
          : results.length > 0,
      decision,
      selectedAgents:
        agents.map(
          (agent) => agent.id
        ),
      results,
    };
  }
}
