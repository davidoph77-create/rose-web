export type RuntimeStatus =
  | "idle"
  | "starting"
  | "ready"
  | "running"
  | "paused"
  | "degraded"
  | "error"
  | "stopped";

export type ModuleStatus =
  | "idle"
  | "starting"
  | "ready"
  | "running"
  | "paused"
  | "error"
  | "stopped";

export type RuntimeEventName =
  | "runtime.starting"
  | "runtime.ready"
  | "runtime.paused"
  | "runtime.resumed"
  | "runtime.stopping"
  | "runtime.stopped"
  | "runtime.error"
  | "runtime.health.checked"
  | "module.registered"
  | "module.started"
  | "module.stopped"
  | "module.error"
  | "command.started"
  | "command.completed"
  | "command.error"
  | string;

export type RuntimeEvent<T = unknown> = {
  id: string;
  name: RuntimeEventName;
  payload: T;
  source: string;
  createdAt: string;
};

export type RuntimeEventHandler<T = unknown> = (
  event: RuntimeEvent<T>
) => void | Promise<void>;

export type RuntimeLogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error";

export type RuntimeLogEntry = {
  id: string;
  level: RuntimeLogLevel;
  message: string;
  source: string;
  data?: unknown;
  createdAt: string;
};

export type RuntimeCommand<T = unknown> = {
  id?: string;
  name: string;
  target?: string;
  payload?: T;
  metadata?: Record<string, unknown>;
};

export type RuntimeCommandResult<T = unknown> = {
  success: boolean;
  commandId: string;
  target?: string;
  data?: T;
  error?: string;
  startedAt: string;
  completedAt: string;
};

export type RuntimeModuleHealth = {
  id: string;
  name: string;
  status: ModuleStatus;
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
  pausedAt?: string;
  requestCount: number;
  successCount: number;
  errorCount: number;
  registeredModules: number;
  lastCommandAt?: string;
  lastError?: string;
};

export interface UnifiedRuntimeModule {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  initialize?(): Promise<void>;
  start?(): Promise<void>;
  stop?(): Promise<void>;
  pause?(): Promise<void>;
  resume?(): Promise<void>;

  getStatus(): ModuleStatus;

  canHandle?(command: RuntimeCommand): boolean;

  invoke?<T = unknown>(
    command: RuntimeCommand
  ): Promise<T>;
}
