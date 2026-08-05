import {
  RoseEvent,
  RoseEventHandler,
  RoseEventName,
  RoseEventSubscription,
} from "./types";

type HandlerEntry = {
  id: string;
  handler: RoseEventHandler;
};

export class EventBus {
  private readonly handlers = new Map<
    RoseEventName,
    HandlerEntry[]
  >();

  private readonly history: RoseEvent[] = [];

  subscribe<TPayload = unknown>(
    eventName: RoseEventName,
    handler: RoseEventHandler<TPayload>
  ): RoseEventSubscription {
    const entry: HandlerEntry = {
      id: this.createId("subscription"),
      handler: handler as RoseEventHandler,
    };

    const current = this.handlers.get(eventName) ?? [];
    this.handlers.set(eventName, [...current, entry]);

    return {
      unsubscribe: () => {
        const existing = this.handlers.get(eventName) ?? [];
        this.handlers.set(
          eventName,
          existing.filter((item) => item.id !== entry.id)
        );
      },
    };
  }

  async publish<TPayload = unknown>(
    name: RoseEventName,
    payload: TPayload,
    source: string
  ): Promise<RoseEvent<TPayload>> {
    const event: RoseEvent<TPayload> = {
      id: this.createId("event"),
      name,
      payload,
      source,
      createdAt: new Date().toISOString(),
    };

    this.history.push(event as RoseEvent);

    const handlers = this.handlers.get(name) ?? [];

    await Promise.all(
      handlers.map(async ({ handler }) => {
        await handler(event as RoseEvent);
      })
    );

    return event;
  }

  getHistory(eventName?: RoseEventName): RoseEvent[] {
    if (!eventName) {
      return [...this.history];
    }

    return this.history.filter(
      (event) => event.name === eventName
    );
  }

  clearHistory(): void {
    this.history.length = 0;
  }

  clearSubscriptions(eventName?: RoseEventName): void {
    if (eventName) {
      this.handlers.delete(eventName);
      return;
    }

    this.handlers.clear();
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
}
