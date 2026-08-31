import {
  RuntimeSnapshot,
  RuntimeStatus,
} from "./RuntimeTypes";

export class RuntimeState {
  private status: RuntimeStatus = "idle";
  private startedAt?: string;
  private stoppedAt?: string;
  private pausedAt?: string;
  private requestCount = 0;
  private successCount = 0;
  private errorCount = 0;
  private lastCommandAt?: string;
  private lastError?: string;

  setStatus(status: RuntimeStatus): void {
    this.status = status;

    if (status === "ready" && !this.startedAt) {
      this.startedAt = new Date().toISOString();
      this.stoppedAt = undefined;
    }

    if (status === "paused") {
      this.pausedAt = new Date().toISOString();
    }

    if (status === "running" || status === "ready") {
      this.pausedAt = undefined;
    }

    if (status === "stopped") {
      this.stoppedAt = new Date().toISOString();
    }
  }

  getStatus(): RuntimeStatus {
    return this.status;
  }

  recordCommand(): void {
    this.requestCount += 1;
    this.lastCommandAt = new Date().toISOString();
  }

  recordSuccess(): void {
    this.successCount += 1;
  }

  recordError(error: unknown): void {
    this.errorCount += 1;
    this.lastError =
      error instanceof Error
        ? error.message
        : String(error);
  }

  snapshot(
    version: string,
    registeredModules: number
  ): RuntimeSnapshot {
    return {
      version,
      status: this.status,
      startedAt: this.startedAt,
      stoppedAt: this.stoppedAt,
      pausedAt: this.pausedAt,
      requestCount: this.requestCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      registeredModules,
      lastCommandAt: this.lastCommandAt,
      lastError: this.lastError,
    };
  }
}
