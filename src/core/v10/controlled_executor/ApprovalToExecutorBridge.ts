import {
  StoredApprovalDecision,
} from "../approval_ui/ApprovalDecisionStore";
import {
  buildControlledAction,
  executeControlledAction,
} from "./ControlledActionExecutor";
import {
  appendControlledExecutionLog,
} from "./ControlledExecutionStore";

export async function processApprovedDecision(
  decision: StoredApprovalDecision
) {
  const action =
    buildControlledAction(decision);

  const result =
    executeControlledAction(action);

  await appendControlledExecutionLog(
    result
  );

  return result;
}
