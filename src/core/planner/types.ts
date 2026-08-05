export type PlanPriority = "low" | "medium" | "high" | "critical";
export type PlanStepStatus =
  | "pending"
  | "in_progress"
  | "done"
  | "blocked"
  | "cancelled";
export type PlanRiskLevel = "low" | "medium" | "high";

export type PlanStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  priority: PlanPriority;
  status: PlanStepStatus;
  estimatedMinutes: number;
  requiresValidation: boolean;
  dependencies: string[];
  blockedReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type Plan = {
  id: string;
  objective: string;
  summary: string;
  priority: PlanPriority;
  riskLevel: PlanRiskLevel;
  steps: PlanStep[];
  totalEstimatedMinutes: number;
  requiresValidation: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlannerInput = {
  objective?: string;
  recommendations: Array<{
    title: string;
    reason: string;
    confidence: number;
    requiresValidation: boolean;
  }>;
};

export type PlannerResult = {
  plan: Plan;
};
