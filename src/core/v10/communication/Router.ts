import {
  AgentManager,
  RoseAgent,
} from "../agents";
import {
  RuntimeCommand,
} from "../runtime";
import {
  AgentMessage,
} from "./MessageTypes";

export class MessageRouter {
  constructor(
    private readonly agentManager:
      AgentManager
  ) {}

  resolve(
    message: AgentMessage
  ): RoseAgent[] {
    switch (
      message.target.type
    ) {
      case "agent": {
        const agent =
          this.agentManager.getAgent(
            message.target.id
          );

        return agent
          ? [agent]
          : [];
      }

      case "capability":
        return this.agentManager
          .getAgents()
          .filter(
            (agent) =>
              agent.isEnabled() &&
              agent.capabilities.includes(
                message.target
                  .capability
              )
          );

      case "broadcast":
        return this.agentManager
          .getAgents()
          .filter(
            (agent) =>
              agent.isEnabled()
          );
    }
  }

  toRuntimeCommand(
    message: AgentMessage
  ): RuntimeCommand {
    return {
      id: message.id,
      name: message.type,
      payload:
        message.payload,
      metadata: {
        ...(message.metadata ??
          {}),
        communication: {
          sourceAgentId:
            message.sourceAgentId,
          correlationId:
            message.correlationId,
          replyTo:
            message.replyTo,
        },
      },
    };
  }
}
