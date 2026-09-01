export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export type ApprovalDecision = {
  id: string;
  validationRequestId: string;
  status: ApprovalStatus;
  decidedAt?: string;
  decidedBy?: string;
  note?: string;
};

export type ApprovalWorkflowState = {
  pending: ApprovalDecision[];
  approved: ApprovalDecision[];
  rejected: ApprovalDecision[];
  summary: string;
};
