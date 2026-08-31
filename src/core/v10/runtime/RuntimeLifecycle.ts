import {
  RuntimeEventBus,
} from "./RuntimeEvents";
import {
  RuntimeLogger,
} from "./RuntimeLogger";
import {
  RuntimeRegistry,
} from "./RuntimeRegistry";
import {
  RuntimeState,
} from "./RuntimeState";

export class RuntimeLifecycle {
  constructor(
    private readonly registry: RuntimeRegistry,
    private readonly state: RuntimeState,
    private readonly events: RuntimeEventBus,
    private readonly logger: RuntimeLogger
  ) {}

  async start(): Promise<void> {
    const current =
      this.state.getStatus();

    if (
      current === "ready" ||
      current === "running"
    ) {
      return;
    }

    this.state.setStatus("starting");
    await this.events.emit(
      "runtime.starting",
      {},
      "runtime-lifecycle"
    );

    for (
      const module of this.registry.getAll()
    ) {
      try {
        await module.initialize?.();
        await module.start?.();

        await this.events.emit(
          "module.started",
          {
            id: module.id,
            status: module.getStatus(),
          },
          module.id
        );

        this.logger.info(
          `Module démarré : ${module.name}`,
          "runtime-lifecycle"
        );
      } catch (error) {
        this.state.recordError(error);
        this.logger.error(
          `Erreur au démarrage du module ${module.name}`,
          "runtime-lifecycle",
          error
        );

        await this.events.emit(
          "module.error",
          {
            id: module.id,
            message:
              error instanceof Error
                ? error.message
                : String(error),
          },
          module.id
        );
      }
    }

    this.state.setStatus("ready");

    await this.events.emit(
      "runtime.ready",
      {},
      "runtime-lifecycle"
    );
  }

  async pause(): Promise<void> {
    if (
      this.state.getStatus() === "paused"
    ) {
      return;
    }

    for (
      const module of this.registry.getAll()
    ) {
      await module.pause?.();
    }

    this.state.setStatus("paused");

    await this.events.emit(
      "runtime.paused",
      {},
      "runtime-lifecycle"
    );
  }

  async resume(): Promise<void> {
    for (
      const module of this.registry.getAll()
    ) {
      await module.resume?.();
    }

    this.state.setStatus("ready");

    await this.events.emit(
      "runtime.resumed",
      {},
      "runtime-lifecycle"
    );
  }

  async stop(): Promise<void> {
    this.state.setStatus("stopped");

    await this.events.emit(
      "runtime.stopping",
      {},
      "runtime-lifecycle"
    );

    const modules =
      [...this.registry.getAll()].reverse();

    for (const module of modules) {
      try {
        await module.stop?.();

        await this.events.emit(
          "module.stopped",
          { id: module.id },
          module.id
        );
      } catch (error) {
        this.logger.error(
          `Erreur à l'arrêt du module ${module.name}`,
          "runtime-lifecycle",
          error
        );
      }
    }

    await this.events.emit(
      "runtime.stopped",
      {},
      "runtime-lifecycle"
    );
  }
}
