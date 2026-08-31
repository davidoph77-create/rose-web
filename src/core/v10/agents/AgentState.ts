import {
  AgentStatus,
} from "./AgentTypes";

export class AgentState {
  private status: AgentStatus = "idle";
  private enabled = true;
  private startedAt?: string;
  private stoppedAt?: string;
  private lastRunAt?: string;
  private runCount = 0;
  private errorCount = 0;
  private lastError?: string;

  setStatus(status: AgentStatus): void {
    this.status = status;

    if (
      (status === "ready" ||
        status === "running") &&
      !this.startedAt
    ) {
      this.startedAt =
        new Date().toISOString();
    }

    if (status === "stopped") {
      this.stoppedAt =
        new Date().toISOString();
    }
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  recordRun(): void {
    this.runCount += 1;
    this.lastRunAt =
      new Date().toISOString();
  }

  recordError(error: unknown): void {
    this.errorCount += 1;
    this.lastError =
      error instanceof Error
        ? error.message
        : String(error);
  }

  snapshot() {
    return {
      status: this.status,
      enabled: this.enabled,
      startedAt: this.startedAt,
      stoppedAt: this.stoppedAt,
      lastRunAt: this.lastRunAt,
      runCount: this.runCount,
      errorCount: this.errorCount,
      lastError: this.lastError,
    };
  }
}
