import {
  StoredApprovalDecision,
} from "../approval_ui/ApprovalDecisionStore";
import {
  buildControlledAction,
  executeControlledAction,
} from "../controlled_executor/ControlledActionExecutor";
import {
  appendControlledExecutionLog,
} from "../controlled_executor/ControlledExecutionStore";
import {
  evaluateExecutionSafetyPolicy,
} from "./ExecutionSafetyPolicy";
import {
  appendExecutionAudit,
} from "./ExecutionAuditStore";

export async function executeAuditedControlledDecision(
  decision: StoredApprovalDecision
) {
  const action =
    buildControlledAction(decision);

  const policy =
    evaluateExecutionSafetyPolicy(action);

  await appendExecutionAudit({
    id:
      `audit_${Date.now()}_` +
      Math.random()
        .toString(36)
        .slice(2, 8),
    createdAt:
      new Date().toISOString(),
    actionId:
      action.id,
    approvalId:
      action.approvalId,
    kind:
      action.kind,
    message:
      action.message,
    decision:
      policy,
  });

  if (!policy.allowed) {
    return {
      action,
      policy,
      execution: null,
      summary:
        `Safety Policy : BLOQUÉE. ${policy.reason}`,
    };
  }

  const execution =
    executeControlledAction(action);

  await appendControlledExecutionLog(
    execution
  );

  return {
    action,
    policy,
    execution,
    summary:
      `Safety Policy : AUTORISÉE EN SIMULATION. Risque=${policy.risk}. ${policy.reason} ${execution.summary}`,
  };
}
