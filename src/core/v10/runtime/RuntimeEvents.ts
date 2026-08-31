import {
  RuntimeEvent,
  RuntimeEventHandler,
  RuntimeEventName,
} from "./RuntimeTypes";

type Subscription = {
  id: string;
  eventName: RuntimeEventName | "*";
  handler: RuntimeEventHandler;
};

export class RuntimeEventBus {
  private readonly subscriptions =
    new Map<string, Subscription>();

  subscribe<T = unknown>(
    eventName: RuntimeEventName | "*",
    handler: RuntimeEventHandler<T>
  ): () => void {
    const id = this.createId("subscription");

    this.subscriptions.set(id, {
      id,
      eventName,
      handler: handler as RuntimeEventHandler,
    });

    return () => {
      this.subscriptions.delete(id);
    };
  }

  once<T = unknown>(
    eventName: RuntimeEventName,
    handler: RuntimeEventHandler<T>
  ): () => void {
    let unsubscribe = () => {};

    unsubscribe = this.subscribe<T>(
      eventName,
      async (event) => {
        unsubscribe();
        await handler(event);
      }
    );

    return unsubscribe;
  }

  async emit<T = unknown>(
    name: RuntimeEventName,
    payload: T,
    source = "runtime"
  ): Promise<RuntimeEvent<T>> {
    const event: RuntimeEvent<T> = {
      id: this.createId("event"),
      name,
      payload,
      source,
      createdAt: new Date().toISOString(),
    };

    const handlers = Array.from(
      this.subscriptions.values()
    ).filter(
      (subscription) =>
        subscription.eventName === name ||
        subscription.eventName === "*"
    );

    await Promise.all(
      handlers.map((subscription) =>
        Promise.resolve(
          subscription.handler(
            event as RuntimeEvent
          )
        ).catch(() => undefined)
      )
    );

    return event;
  }

  clear(): void {
    this.subscriptions.clear();
  }

  count(): number {
    return this.subscriptions.size;
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
}
