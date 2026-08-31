import {
  V10Module,
} from "../contracts/ModuleContract";
import {
  V10ModuleDescriptor,
  V10Status,
} from "../foundation/V10Types";

type LegacyBrainLike = {
  initialize?: () => Promise<void>;
  getStatus?: () => string;
};

export class LegacyBrainAdapter
  implements V10Module
{
  readonly id =
    "legacy-brain-adapter";
  readonly name =
    "Legacy Brain Adapter";
  readonly version = "10.0.1";

  private status:
    V10Status = "idle";

  constructor(
    private readonly brain?:
      LegacyBrainLike
  ) {}

  async initialize():
    Promise<void> {
    this.status =
      "initializing";

    if (
      this.brain?.initialize
    ) {
      await this.brain.initialize();
    }

    this.status = "ready";
  }

  getStatus(): V10Status {
    const legacyStatus =
      this.brain?.getStatus?.();

    if (
      legacyStatus === "idle" ||
      legacyStatus === "ready" ||
      legacyStatus === "running" ||
      legacyStatus === "error"
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
