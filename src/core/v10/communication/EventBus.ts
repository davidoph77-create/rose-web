import {
  CommunicationEvent,
  CommunicationEventName,
} from "./MessageTypes";

export type CommunicationEventHandler<T = unknown> = (
  event: CommunicationEvent<T>
) => void | Promise<void>;

type Subscription = {
  id: string;
  name: CommunicationEventName | "*";
  handler: CommunicationEventHandler;
};

export class CommunicationEventBus {
  private readonly subscriptions =
    new Map<string, Subscription>();

  subscribe<T = unknown>(
    name: CommunicationEventName | "*",
    handler: CommunicationEventHandler<T>
  ): () => void {
    const id =
      `communication-sub-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;

    this.subscriptions.set(
      id,
      {
        id,
        name,
        handler:
          handler as CommunicationEventHandler,
      }
    );

    return () => {
      this.subscriptions.delete(id);
    };
  }

  async emit<T = unknown>(
    name: CommunicationEventName,
    payload: T,
    source =
      "communication"
  ): Promise<
    CommunicationEvent<T>
  > {
    const event:
      CommunicationEvent<T> = {
      id:
        `communication-event-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,
      name,
      payload,
      source,
      createdAt:
        new Date().toISOString(),
    };

    const handlers =
      Array.from(
        this.subscriptions.values()
      ).filter(
        (subscription) =>
          subscription.name ===
            name ||
          subscription.name ===
            "*"
      );

    await Promise.all(
      handlers.map(
        (subscription) =>
          Promise.resolve(
            subscription.handler(
              event as CommunicationEvent
            )
          ).catch(
            () => undefined
          )
      )
    );

    return event;
  }

  count(): number {
    return this.subscriptions.size;
  }

  clear(): void {
    this.subscriptions.clear();
  }
}
