import {
  StoredApprovalDecision,
} from "../approval_ui/ApprovalDecisionStore";
import {
  executeAuditedControlledDecision,
} from "../execution_audit";
import {
  enqueueExecutionItem,
} from "./ExecutionQueueStore";

export async function processDecisionToExecutionQueue(
  decision: StoredApprovalDecision
) {
  const audited =
    await executeAuditedControlledDecision(
      decision
    );

  if (
    !audited.policy.allowed ||
    !audited.execution
  ) {
    return {
      audited,
      queueItem: null,
      summary:
        audited.summary,
    };
  }

  const queueItem = {
    id:
      `queue_${Date.now()}_` +
      Math.random()
        .toString(36)
        .slice(2, 8),
    createdAt:
      new Date().toISOString(),
    actionId:
      audited.action.id,
    approvalId:
      audited.action.approvalId,
    kind:
      audited.action.kind,
    message:
      audited.action.message,
    risk:
      audited.policy.risk,
    status:
      "queued" as const,
    simulationOnly:
      true as const,
  };

  await enqueueExecutionItem(
    queueItem
  );

  return {
    audited,
    queueItem,
    summary:
      `${audited.summary} ` +
      `Action ajoutée à la file d'exécution simulée pour revue.`,
  };
}
