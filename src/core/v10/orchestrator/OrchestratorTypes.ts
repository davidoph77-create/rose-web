export type OrchestratorStepStatus =
  | "prepared"
  | "ready"
  | "blocked"
  | "completed";

export type OrchestratorStep = {
  id: string;
  order: number;
  agent: string;
  title: string;
  dependsOn: string[];
  status: OrchestratorStepStatus;
  requiresValidation: boolean;
  external: boolean;
  output: string;
};

export type OrchestratorResult = {
  intent: string;
  selectedAgents: string[];
  sequence: OrchestratorStep[];
  blockedExternalActions: number;
  readyInternalActions: number;
  requiresValidation: boolean;
  summary: string;
};
