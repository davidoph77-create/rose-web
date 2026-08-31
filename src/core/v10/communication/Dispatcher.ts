import {
  AgentManager,
} from "../agents";
import {
  MessageRouter,
} from "./Router";
import {
  AgentMessage,
  MessageDeliveryResult,
} from "./MessageTypes";
import {
  CommunicationEventBus,
} from "./EventBus";
import {
  Inbox,
} from "./Inbox";

export class MessageDispatcher {
  private readonly inboxes =
    new Map<string, Inbox>();

  constructor(
    private readonly agentManager:
      AgentManager,
    private readonly router:
      MessageRouter,
    private readonly events:
      CommunicationEventBus
  ) {}

  getInbox(
    agentId: string
  ): Inbox {
    let inbox =
      this.inboxes.get(agentId);

    if (!inbox) {
      inbox =
        new Inbox(agentId);
      this.inboxes.set(
        agentId,
        inbox
      );
    }

    return inbox;
  }

  async dispatch(
    message: AgentMessage
  ): Promise<
    MessageDeliveryResult
  > {
    message.status =
      "routing";

    await this.events.emit(
      "message.routing",
      { messageId: message.id },
      "message-dispatcher"
    );

    const targets =
      this.router.resolve(
        message
      );

    const deliveredTo:
      string[] = [];

    const failedTo: Array<{
      agentId: string;
      error: string;
    }> = [];

    const command =
      this.router.toRuntimeCommand(
        message
      );

    await Promise.all(
      targets.map(
        async (agent) => {
          const result =
            await agent.execute({
              command,
              context:
                this.agentManager
                  .setContext({})
            });

          if (
            result.success
          ) {
            deliveredTo.push(
              agent.id
            );

            this.getInbox(
              agent.id
            ).push(
              {
                ...message,
                status:
                  "delivered",
              }
            );

            await this.events.emit(
              "message.received",
              {
                messageId:
                  message.id,
                agentId:
                  agent.id,
              },
              agent.id
            );
          } else {
            failedTo.push({
              agentId:
                agent.id,
              error:
                result.error ??
                "Erreur inconnue",
            });
          }
        }
      )
    );

    message.status =
      failedTo.length > 0 &&
      deliveredTo.length === 0
        ? "failed"
        : "delivered";

    await this.events.emit(
      message.status ===
        "delivered"
        ? "message.delivered"
        : "message.failed",
      {
        messageId:
          message.id,
        deliveredTo,
        failedTo,
      },
      "message-dispatcher"
    );

    return {
      messageId:
        message.id,
      deliveredTo,
      failedTo,
      completedAt:
        new Date().toISOString(),
    };
  }
}
