export type ExecutionRiskLevel =
  | "low"
  | "medium"
  | "high";

export type ExecutionPolicyDecision = {
  allowed: boolean;
  simulationOnly: boolean;
  risk: ExecutionRiskLevel;
  reason: string;
};

export type ExecutionAuditEntry = {
  id: string;
  createdAt: string;
  actionId: string;
  approvalId?: string;
  kind: string;
  message: string;
  decision: ExecutionPolicyDecision;
};
