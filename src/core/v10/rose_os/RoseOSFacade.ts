import {
  RoseOSRequest,
} from "./RoseOSTypes";
import {
  installRoseOS,
} from "./RoseOSInstaller";
import {
  RoseOSBuildOptions,
} from "./RoseOSBuilder";

export class RoseOSFacade {
  private readonly system;

  constructor(
    options:
      RoseOSBuildOptions = {}
  ) {
    this.system =
      installRoseOS(
        options
      );
  }

  async start() {
    await this.system
      .kernel.start();

    return this;
  }

  async ask(
    request:
      RoseOSRequest | string
  ) {
    return this.system
      .kernel.handle(
        typeof request ===
        "string"
          ? {
              message:
                request,
            }
          : request
      );
  }

  diagnostics() {
    return this.system
      .kernel
      .diagnostics();
  }

  getSystem() {
    return this.system;
  }

  async stop() {
    await this.system
      .kernel.stop();
  }
}
