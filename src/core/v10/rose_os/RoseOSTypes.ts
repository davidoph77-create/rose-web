export type RoseOSStatus =
  | "idle"
  | "starting"
  | "ready"
  | "stopping"
  | "stopped"
  | "error";

export type RoseOSRequest = {
  message: string;
  goalId?: string;
  metadata?: Record<string, unknown>;
  approvedActionIds?: string[];
};

export type RoseOSResponse = {
  success: boolean;
  status: RoseOSStatus;
  mode:
    | "cognitive"
    | "autonomy"
    | "direct";
  result: unknown;
  startedAt: string;
  completedAt: string;
};

export type RoseOSDiagnostics = {
  status: RoseOSStatus;
  runtimeHealthy: boolean;
  registeredModules: string[];
  registeredAgents: string[];
  memoryCount: number;
  goalsCount: number;
  plansCount: number;
  generatedAt: string;
};
