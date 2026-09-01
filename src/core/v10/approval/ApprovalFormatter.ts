import {
  ApprovalWorkflowState,
} from "./ApprovalTypes";

export function formatApprovalWorkflow(
  state: ApprovalWorkflowState
): string {
  const parts: string[] = [];

  if (state.pending.length > 0) {
    parts.push(
      `${state.pending.length} en attente`
    );
  }

  if (state.approved.length > 0) {
    parts.push(
      `${state.approved.length} approuvée(s)`
    );
  }

  if (state.rejected.length > 0) {
    parts.push(
      `${state.rejected.length} refusée(s)`
    );
  }

  return parts.length > 0
    ? `Workflow d'approbation : ${parts.join(", ")}.`
    : "Workflow d'approbation vide.";
}
