export type AutonomyState =
  | "idle"
  | "analyzing"
  | "planning"
  | "waiting_validation"
  | "executing"
  | "completed"
  | "blocked"
  | "error";

export type AutonomyPolicy = {
  enabled: boolean;
  maxCycles: number;
  requireValidationForExternalActions: boolean;
  requireValidationForBusinessActions: boolean;
  requireValidationForCalendarActions: boolean;
  allowMemoryWrites: boolean;
  allowGoalProgressUpdates: boolean;
};

export type AutonomyCycleInput = {
  message: string;
  goalId?: string;
  metadata?: Record<string, unknown>;
};

export type AutonomyAction = {
  id: string;
  type: string;
  capability?: string;
  description: string;
  requiresValidation: boolean;
  payload?: Record<string, unknown>;
};

export type AutonomyCycleResult = {
  success: boolean;
  state: AutonomyState;
  cycle: number;
  decision?: unknown;
  plan?: unknown;
  actions: AutonomyAction[];
  executedActions: AutonomyAction[];
  pendingValidation: AutonomyAction[];
  errors: string[];
  startedAt: string;
  completedAt: string;
};
