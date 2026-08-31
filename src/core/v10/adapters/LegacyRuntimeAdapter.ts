import {
  V10Module,
} from "../contracts/ModuleContract";
import {
  V10ModuleDescriptor,
  V10Status,
} from "../foundation/V10Types";

type LegacyRuntimeLike = {
  boot?: () => Promise<unknown>;
  shutdown?: () => Promise<void>;
  snapshot?: () => {
    status?: string;
  };
};

export class LegacyRuntimeAdapter
  implements V10Module
{
  readonly id =
    "legacy-runtime-adapter";
  readonly name =
    "Legacy Runtime Adapter";
  readonly version = "10.0.1";

  private status:
    V10Status = "idle";

  constructor(
    private readonly runtime?:
      LegacyRuntimeLike
  ) {}

  async initialize():
    Promise<void> {
    this.status =
      "initializing";

    if (
      this.runtime?.boot
    ) {
      await this.runtime.boot();
    }

    this.status = "ready";
  }

  async shutdown():
    Promise<void> {
    if (
      this.runtime?.shutdown
    ) {
      await this.runtime.shutdown();
    }

    this.status = "stopped";
  }

  getStatus(): V10Status {
    const legacyStatus =
      this.runtime?.snapshot?.()
        ?.status;

    if (
      legacyStatus ===
        "ready" ||
      legacyStatus ===
        "running" ||
      legacyStatus ===
        "degraded" ||
      legacyStatus ===
        "error" ||
      legacyStatus ===
        "stopped"
    ) {
      return legacyStatus;
    }

    return this.status;
  }

  describe():
    V10ModuleDescriptor {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      kind: "legacy",
      status:
        this.getStatus(),
      legacy: true,
      dependencies: [],
    };
  }
}
