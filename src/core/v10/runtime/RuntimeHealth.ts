import {
  RuntimeRegistry,
} from "./RuntimeRegistry";
import {
  RuntimeHealthReport,
  RuntimeStatus,
} from "./RuntimeTypes";

export class RuntimeHealth {
  constructor(
    private readonly registry: RuntimeRegistry
  ) {}

  check(
    runtimeStatus: RuntimeStatus
  ): RuntimeHealthReport {
    const checkedAt =
      new Date().toISOString();

    const modules =
      this.registry.getAll().map(
        (module) => {
          let status:
            | ReturnType<
                typeof module.getStatus
              >
            = "error";

          try {
            status = module.getStatus();
          } catch {
            status = "error";
          }

          const healthy =
            status === "idle" ||
            status === "ready" ||
            status === "running" ||
            status === "paused";

          return {
            id: module.id,
            name: module.name,
            status,
            healthy,
            detail: healthy
              ? "Module disponible"
              : "Module indisponible",
            checkedAt,
          };
        }
      );

    return {
      healthy:
        modules.every(
          (module) => module.healthy
        ),
      runtimeStatus,
      modules,
      checkedAt,
    };
  }
}
