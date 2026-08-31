import { RuntimeRegistry } from "./RuntimeRegistry";
import {
  RuntimeHealthReport,
  RuntimeModuleHealth,
  RuntimeStatus,
} from "./RuntimeTypes";

export class RuntimeHealthMonitor {
  constructor(private readonly registry: RuntimeRegistry) {}

  check(runtimeStatus: RuntimeStatus): RuntimeHealthReport {
    const checkedAt = new Date().toISOString();

    const modules: RuntimeModuleHealth[] = this.registry.getAll().map((module) => {
      let status: ReturnType<typeof module.getStatus> | "unknown" = "unknown";

      try {
        status = module.getStatus();
      } catch {
        status = "unknown";
      }

      const healthy = status === "ready" || status === "idle";

      return {
        id: module.id,
        name: module.name,
        status,
        healthy,
        detail: healthy ? "Module disponible" : "Module non prêt",
        checkedAt,
      };
    });

    return {
      healthy: modules.length > 0 && modules.every((module) => module.healthy),
      runtimeStatus,
      modules,
      checkedAt,
    };
  }
}
