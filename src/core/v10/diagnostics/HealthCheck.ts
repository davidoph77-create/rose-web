import {
  V10ModuleRegistry,
} from "../foundation/ModuleRegistry";
import {
  V10HealthReport,
} from "../foundation/V10Types";

export class V10HealthCheck {
  constructor(
    private readonly registry:
      V10ModuleRegistry
  ) {}

  run(): V10HealthReport {
    const items =
      this.registry.getAll().map(
        (module) => {
          let status:
            | ReturnType<
                typeof module.getStatus
              >
            | "unknown" =
            "unknown";

          try {
            status =
              module.getStatus();
          } catch {
            status = "unknown";
          }

          const healthy =
            status === "ready" ||
            status === "idle" ||
            status === "running";

          return {
            id: module.id,
            healthy,
            status,
            detail: healthy
              ? "Module disponible"
              : "Module indisponible ou dégradé",
          };
        }
      );

    return {
      healthy:
        items.length === 0 ||
        items.every(
          (item) => item.healthy
        ),
      checkedAt:
        new Date().toISOString(),
      items,
    };
  }
}
