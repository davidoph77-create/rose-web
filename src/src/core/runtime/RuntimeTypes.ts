import { CoreInput, CoreOutput, CoreStatus } from "../types/core";

export type RuntimeStatus =
  | "stopped" | "booting" | "ready" | "running"
  | "degraded" | "error" | "shutting_down";

export type RuntimeModuleHealth = {
  id: string;
  name: string;
  status: CoreStatus | "unknown";
  healthy: boolean;
  detail?: string;
  checkedAt: string;
};

export type RuntimeHealthReport = {
  healthy: boolean;
  runtimeStatus: RuntimeStatus;
  modules: RuntimeModuleHealth[];
  checkedAt: string;
};

export type RuntimeSnapshot = {
  version: string;
  status: RuntimeStatus;
  startedAt?: string;
  stoppedAt?: string;
  requestCount: number;
  errorCount: number;
  lastRequestAt?: string;
  lastError?: string;
};

export type RuntimeRequest = CoreInput;

export type RuntimeResponse = {
  output: CoreOutput;
  health: RuntimeHealthReport;
  runtime: RuntimeSnapshot;
};
