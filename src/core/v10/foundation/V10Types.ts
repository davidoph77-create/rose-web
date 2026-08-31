export type V10Status =
  | "idle"
  | "initializing"
  | "ready"
  | "running"
  | "degraded"
  | "error"
  | "stopped";

export type V10ModuleKind =
  | "runtime"
  | "brain"
  | "memory"
  | "planner"
  | "autonomy"
  | "perception"
  | "execution"
  | "learning"
  | "agent"
  | "service"
  | "ui"
  | "legacy";

export type V10ModuleDescriptor = {
  id: string;
  name: string;
  version: string;
  kind: V10ModuleKind;
  status: V10Status;
  legacy?: boolean;
  dependencies?: string[];
};

export type V10HealthItem = {
  id: string;
  healthy: boolean;
  status: V10Status | "unknown";
  detail?: string;
};

export type V10HealthReport = {
  healthy: boolean;
  checkedAt: string;
  items: V10HealthItem[];
};

export type V10BootReport = {
  version: string;
  status: V10Status;
  startedAt: string;
  modules: V10ModuleDescriptor[];
  health: V10HealthReport;
};
