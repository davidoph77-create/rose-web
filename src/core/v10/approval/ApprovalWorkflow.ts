import {
  ApprovalDecision,
  ApprovalWorkflowState,
} from "./ApprovalTypes";

type ValidationLike = {
  pending?: Array<{
    id?: string;
  }>;
};

export function buildApprovalWorkflow(
  validation: ValidationLike
): ApprovalWorkflowState {
  const pendingRequests =
    Array.isArray(validation.pending)
      ? validation.pending
      : [];

  const pending: ApprovalDecision[] =
    pendingRequests.map((request, index) => ({
      id:
        request.id
          ? `approval_${request.id}`
          : `approval_${Date.now()}_${index}`,
      validationRequestId:
        request.id ||
        `validation_${index}`,
      status: "pending",
    }));

  return {
    pending,
    approved: [],
    rejected: [],
    summary:
      pending.length > 0
        ? `${pending.length} approbation(s) en attente.`
        : "Aucune approbation en attente.",
  };
}

export function approveDecision(
  decision: ApprovalDecision,
  decidedBy = "David",
  note?: string
): ApprovalDecision {
  return {
    ...decision,
    status: "approved",
    decidedAt: new Date().toISOString(),
    decidedBy,
    note,
  };
}

export function rejectDecision(
  decision: ApprovalDecision,
  decidedBy = "David",
  note?: string
): ApprovalDecision {
  return {
    ...decision,
    status: "rejected",
    decidedAt: new Date().toISOString(),
    decidedBy,
    note,
  };
}
