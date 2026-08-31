import {
  AgentManager,
} from "../agents";
import {
  createMessage,
  CreateMessageInput,
} from "./Message";
import {
  MessageQueue,
} from "./MessageQueue";
import {
  CommunicationEventBus,
} from "./EventBus";
import {
  MessageRouter,
} from "./Router";
import {
  MessageDispatcher,
} from "./Dispatcher";
import {
  Outbox,
} from "./Outbox";
import {
  AgentMessage,
  MessageDeliveryResult,
} from "./MessageTypes";

export class MessageBus {
  private readonly queue =
    new MessageQueue();

  private readonly events =
    new CommunicationEventBus();

  private readonly router:
    MessageRouter;

  private readonly dispatcher:
    MessageDispatcher;

  private readonly outboxes =
    new Map<string, Outbox>();

  constructor(
    private readonly agentManager:
      AgentManager
  ) {
    this.router =
      new MessageRouter(
        this.agentManager
      );

    this.dispatcher =
      new MessageDispatcher(
        this.agentManager,
        this.router,
        this.events
      );
  }

  getEvents():
    CommunicationEventBus {
    return this.events;
  }

  getOutbox(
    agentId: string
  ): Outbox {
    let outbox =
      this.outboxes.get(
        agentId
      );

    if (!outbox) {
      outbox =
        new Outbox(agentId);

      this.outboxes.set(
        agentId,
        outbox
      );
    }

    return outbox;
  }

  getInbox(
    agentId: string
  ) {
    return this.dispatcher.getInbox(
      agentId
    );
  }

  async send<T = unknown>(
    input:
      CreateMessageInput<T>
  ): Promise<
    MessageDeliveryResult
  > {
    const message =
      createMessage(input);

    this.getOutbox(
      message.sourceAgentId
    ).push(message);

    this.queue.enqueue(
      message
    );

    await this.events.emit(
      "message.queued",
      {
        messageId:
          message.id,
      },
      message.sourceAgentId
    );

    return this.processNext();
  }

  async processNext():
    Promise<
      MessageDeliveryResult
    > {
    const message =
      this.queue.dequeue();

    if (!message) {
      return {
        messageId: "",
        deliveredTo: [],
        failedTo: [],
        completedAt:
          new Date().toISOString(),
      };
    }

    return this.dispatcher.dispatch(
      message
    );
  }

  async flush():
    Promise<
      MessageDeliveryResult[]
    > {
    const results:
      MessageDeliveryResult[] =
      [];

    while (
      this.queue.size() > 0
    ) {
      results.push(
        await this.processNext()
      );
    }

    return results;
  }

  pending(): AgentMessage[] {
    return this.queue.getAll();
  }

  clear(): void {
    this.queue.clear();
    this.events.clear();
    this.outboxes.clear();
  }
}
