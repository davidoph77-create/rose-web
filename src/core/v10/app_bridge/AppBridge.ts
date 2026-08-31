import {
  AppBridgeConfig,
  AppBridgeRequest,
  AppBridgeSnapshot,
  AppBridgeStatus,
} from "./AppBridgeTypes";
import {
  configureRoseOS,
  getRoseOS,
  startRoseOS,
  stopRoseOS,
} from "./RoseOSSingleton";

export class AppBridge {
  private status:
    AppBridgeStatus = "idle";

  private started = false;
  private lastError?: string;

  constructor(
    config:
      AppBridgeConfig = {}
  ) {
    configureRoseOS(
      config
    );

    if (
      config.autoStart
    ) {
      void this.start();
    }
  }

  async start() {
    if (
      this.started &&
      this.status === "ready"
    ) {
      return;
    }

    this.status = "starting";
    this.lastError = undefined;

    try {
      await startRoseOS();
      this.started = true;
      this.status = "ready";
    } catch (error) {
      this.status = "error";
      this.lastError =
        error instanceof Error
          ? error.message
          : String(error);

      throw error;
    }
  }

  async ask(
    request:
      AppBridgeRequest
  ) {
    if (!this.started) {
      await this.start();
    }

    try {
      return await getRoseOS()
        .ask(request);
    } catch (error) {
      this.status = "error";
      this.lastError =
        error instanceof Error
          ? error.message
          : String(error);

      throw error;
    }
  }

  diagnostics() {
    return getRoseOS()
      .diagnostics();
  }

  snapshot():
    AppBridgeSnapshot {
    let diagnostics:
      ReturnType<
        AppBridge["diagnostics"]
      > | undefined;

    try {
      if (this.started) {
        diagnostics =
          this.diagnostics();
      }
    } catch {
      diagnostics =
        undefined;
    }

    return {
      status:
        this.status,
      started:
        this.started,
      diagnostics,
      lastError:
        this.lastError,
      generatedAt:
        new Date().toISOString(),
    };
  }

  async stop() {
    if (!this.started) {
      this.status = "stopped";
      return;
    }

    this.status = "stopping";

    try {
      await stopRoseOS();
      this.started = false;
      this.status = "stopped";
    } catch (error) {
      this.status = "error";
      this.lastError =
        error instanceof Error
          ? error.message
          : String(error);

      throw error;
    }
  }
}
