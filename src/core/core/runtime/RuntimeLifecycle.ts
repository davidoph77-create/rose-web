import { RuntimeSnapshot, RuntimeStatus } from "./RuntimeTypes";

export class RuntimeLifecycle {
  private status: RuntimeStatus = "stopped";
  private startedAt?: string;
  private stoppedAt?: string;
  private requestCount = 0;
  private errorCount = 0;
  private lastRequestAt?: string;
  private lastError?: string;

  setStatus(status: RuntimeStatus): void {
    this.status = status;

    if (status === "ready" && !this.startedAt) {
      this.startedAt = new Date().toISOString();
      this.stoppedAt = undefined;
    }

    if (status === "stopped") {
      this.stoppedAt = new Date().toISOString();
    }
  }

  recordRequest(): void {
    this.requestCount += 1;
    this.lastRequestAt = new Date().toISOString();
  }

  recordError(error: unknown): void {
    this.errorCount += 1;
    this.lastError = error instanceof Error ? error.message : String(error);
  }

  resetErrors(): void {
    this.errorCount = 0;
    this.lastError = undefined;
  }

  getStatus(): RuntimeStatus {
    return this.status;
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  snapshot(version: string): RuntimeSnapshot {
    return {
      version,
      status: this.status,
      startedAt: this.startedAt,
      stoppedAt: this.stoppedAt,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      lastRequestAt: this.lastRequestAt,
      lastError: this.lastError,
    };
  }
}
