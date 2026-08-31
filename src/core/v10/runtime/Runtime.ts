import {
  RuntimeDispatcher,
} from "./RuntimeDispatcher";
import {
  RuntimeEventBus,
} from "./RuntimeEvents";
import {
  RuntimeHealth,
} from "./RuntimeHealth";
import {
  RuntimeHooks,
} from "./RuntimeHooks";
import {
  RuntimeLifecycle,
} from "./RuntimeLifecycle";
import {
  RuntimeLogger,
} from "./RuntimeLogger";
import {
  RuntimeRegistry,
} from "./RuntimeRegistry";
import {
  RuntimeState,
} from "./RuntimeState";
import {
  RuntimeCommand,
  RuntimeEventHandler,
  RuntimeEventName,
  UnifiedRuntimeModule,
} from "./RuntimeTypes";

export class Runtime {
  readonly id =
    "rose-v10-runtime";
  readonly name =
    "Rose V10 Unified Runtime";
  readonly version = "10.0.3";

  private readonly registry =
    new RuntimeRegistry();
  private readonly events =
    new RuntimeEventBus();
  private readonly logger =
    new RuntimeLogger();
  private readonly state =
    new RuntimeState();
  private readonly hooks =
    new RuntimeHooks();
  private readonly healthMonitor =
    new RuntimeHealth(
      this.registry
    );
  private readonly lifecycle =
    new RuntimeLifecycle(
      this.registry,
      this.state,
      this.events,
      this.logger
    );
  private readonly dispatcher =
    new RuntimeDispatcher(
      this.registry,
      this.state,
      this.events,
      this.logger
    );

  async start(): Promise<void> {
    await this.hooks.run(
      "beforeStart"
    );

    await this.lifecycle.start();

    await this.hooks.run(
      "afterStart"
    );
  }

  async stop(): Promise<void> {
    await this.hooks.run(
      "beforeStop"
    );

    await this.lifecycle.stop();

    await this.hooks.run(
      "afterStop"
    );
  }

  async pause(): Promise<void> {
    await this.lifecycle.pause();
  }

  async resume(): Promise<void> {
    await this.lifecycle.resume();
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  register(
    module: UnifiedRuntimeModule
  ): void {
    this.registry.register(
      module
    );

    void this.events.emit(
      "module.registered",
      {
        id: module.id,
        name: module.name,
        version: module.version,
      },
      this.id
    );
  }

  unregister(
    moduleId: string
  ): boolean {
    return this.registry.unregister(
      moduleId
    );
  }

  async invoke<T = unknown>(
    command: RuntimeCommand
  ) {
    await this.hooks.run(
      "beforeCommand",
      command
    );

    const result =
      await this.dispatcher.dispatch<T>(
        command
      );

    await this.hooks.run(
      "afterCommand",
      result
    );

    return result;
  }

  emit<T = unknown>(
    name: RuntimeEventName,
    payload: T,
    source = this.id
  ) {
    return this.events.emit(
      name,
      payload,
      source
    );
  }

  subscribe<T = unknown>(
    name: RuntimeEventName | "*",
    handler: RuntimeEventHandler<T>
  ): () => void {
    return this.events.subscribe(
      name,
      handler
    );
  }

  addHook(
    ...args: Parameters<
      RuntimeHooks["add"]
    >
  ) {
    return this.hooks.add(...args);
  }

  health() {
    const report =
      this.healthMonitor.check(
        this.state.getStatus()
      );

    void this.events.emit(
      "runtime.health.checked",
      report,
      this.id
    );

    return report;
  }

  snapshot() {
    return this.state.snapshot(
      this.version,
      this.registry.size()
    );
  }

  diagnostics() {
    return {
      snapshot: this.snapshot(),
      health: this.health(),
      modules:
        this.registry.getAll().map(
          (module) => ({
            id: module.id,
            name: module.name,
            version: module.version,
            status:
              module.getStatus(),
          })
        ),
      subscriptions:
        this.events.count(),
      logs:
        this.logger
          .getEntries()
          .slice(-50),
      generatedAt:
        new Date().toISOString(),
    };
  }

  getRegistry(): RuntimeRegistry {
    return this.registry;
  }

  getLogger(): RuntimeLogger {
    return this.logger;
  }
}

export const roseRuntime =
  new Runtime();
