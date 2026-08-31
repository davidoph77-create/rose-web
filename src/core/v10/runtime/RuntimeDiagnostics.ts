import {
  RuntimeEventBus,
} from "./RuntimeEvents";
import {
  RuntimeHealth,
} from "./RuntimeHealth";
import {
  RuntimeLogger,
} from "./RuntimeLogger";
import {
  RuntimeRegistry,
} from "./RuntimeRegistry";
import {
  RuntimeState,
} from "./RuntimeState";

export class RuntimeDiagnostics {
  constructor(
    private readonly version: string,
    private readonly registry: RuntimeRegistry,
    private readonly state: RuntimeState,
    private readonly health: RuntimeHealth,
    private readonly logger: RuntimeLogger,
    private readonly events: RuntimeEventBus
  ) {}

  report() {
    return {
      snapshot:
        this.state.snapshot(
          this.version,
          this.registry.size()
        ),
      health:
        this.health.check(
          this.state.getStatus()
        ),
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
}
