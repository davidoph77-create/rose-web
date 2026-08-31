import {
  V10Module,
} from "../contracts/ModuleContract";
import {
  V10HealthCheck,
} from "../diagnostics/HealthCheck";
import {
  V10ModuleRegistry,
} from "./ModuleRegistry";
import {
  V10BootReport,
  V10Status,
} from "./V10Types";

export class RoseV10Foundation {
  readonly id =
    "rose-v10-foundation";
  readonly name =
    "Rose V10 Foundation";
  readonly version = "10.0.1";

  private readonly registry =
    new V10ModuleRegistry();

  private readonly health =
    new V10HealthCheck(
      this.registry
    );

  private status:
    V10Status = "idle";

  register(
    module: V10Module
  ): void {
    this.registry.register(
      module
    );
  }

  async boot():
    Promise<V10BootReport> {
    this.status =
      "initializing";

    const modules =
      this.registry.getAll();

    for (
      const module of modules
    ) {
      await module.initialize();
    }

    const health =
      this.health.run();

    this.status =
      health.healthy
        ? "ready"
        : "degraded";

    return {
      version: this.version,
      status: this.status,
      startedAt:
        new Date().toISOString(),
      modules:
        this.registry.describeAll(),
      health,
    };
  }

  async shutdown():
    Promise<void> {
    const modules =
      [...this.registry.getAll()]
        .reverse();

    for (
      const module of modules
    ) {
      if (
        module.shutdown
      ) {
        await module.shutdown();
      }
    }

    this.status = "stopped";
  }

  getStatus(): V10Status {
    return this.status;
  }

  getRegistry():
    V10ModuleRegistry {
    return this.registry;
  }

  healthReport() {
    return this.health.run();
  }
}
