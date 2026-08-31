export type PlanPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

export type PlanStepStatus =
  | "pending"
  | "ready"
  | "running"
  | "done"
  | "blocked"
  | "cancelled";

export type PlanStep = {
  id: string;
  title: string;
  description?: string;
  order: number;
  priority: PlanPriority;
  status: PlanStepStatus;
  estimatedMinutes?: number;
  requiresValidation: boolean;
  dependencies: string[];
  assignedCapability?: string;
  metadata?: Record<string, unknown>;
};

export type Plan = {
  id: string;
  objective: string;
  createdAt: string;
  updatedAt: string;
  status:
    | "draft"
    | "ready"
    | "running"
    | "done"
    | "cancelled";
  steps: PlanStep[];
  metadata?: Record<string, unknown>;
};

export type CreatePlanInput = {
  objective: string;
  context?: Record<string, unknown>;
  hints?: string[];
};

export type PlannerAnalysis = {
  objective: string;
  detectedCapabilities: string[];
  complexity:
    | "simple"
    | "moderate"
    | "complex";
  requiresValidation: boolean;
};
