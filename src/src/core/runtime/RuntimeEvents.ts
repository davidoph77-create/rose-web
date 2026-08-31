export type RuntimeEventName =
  | "runtime.booting"
  | "runtime.ready"
  | "runtime.request.started"
  | "runtime.request.completed"
  | "runtime.health.checked"
  | "runtime.degraded"
  | "runtime.error"
  | "runtime.shutting_down"
  | "runtime.stopped";

export type RuntimeEvent<TPayload = unknown> = {
  id: string;
  name: RuntimeEventName;
  payload: TPayload;
  createdAt: string;
};

export type RuntimeEventHandler<TPayload = unknown> = (
  event: RuntimeEvent<TPayload>
) => void | Promise<void>;

export class RuntimeEventBus {
  private readonly handlers = new Map<RuntimeEventName, RuntimeEventHandler[]>();

  subscribe<TPayload = unknown>(
    name: RuntimeEventName,
    handler: RuntimeEventHandler<TPayload>
  ): () => void {
    const list = this.handlers.get(name) ?? [];
    this.handlers.set(name, [...list, handler as RuntimeEventHandler]);

    return () => {
      const current = this.handlers.get(name) ?? [];
      this.handlers.set(name, current.filter((h) => h !== handler));
    };
  }

  async publish<TPayload = unknown>(
    name: RuntimeEventName,
    payload: TPayload
  ): Promise<RuntimeEvent<TPayload>> {
    const event: RuntimeEvent<TPayload> = {
      id: `runtime-event-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      name,
      payload,
      createdAt: new Date().toISOString(),
    };

    await Promise.all(
      (this.handlers.get(name) ?? []).map((handler) =>
        handler(event as RuntimeEvent)
      )
    );

    return event;
  }
}
