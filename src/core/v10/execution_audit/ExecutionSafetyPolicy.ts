import {
  ControlledAction,
} from "../controlled_executor/ControlledActionTypes";
import {
  ExecutionPolicyDecision,
} from "./ExecutionPolicyTypes";

export function evaluateExecutionSafetyPolicy(
  action: ControlledAction
): ExecutionPolicyDecision {
  if (action.status === "rejected") {
    return {
      allowed: false,
      simulationOnly: true,
      risk: "low",
      reason:
        "Action refusée par l'utilisateur.",
    };
  }

  if (action.status !== "authorized") {
    return {
      allowed: false,
      simulationOnly: true,
      risk: "medium",
      reason:
        "Action non autorisée par une décision humaine.",
    };
  }

  if (
    action.kind === "calendar" ||
    action.kind === "web"
  ) {
    return {
      allowed: true,
      simulationOnly: true,
      risk: "high",
      reason:
        "Action externe autorisée humainement mais limitée à la simulation dans V10-020.",
    };
  }

  return {
    allowed: true,
    simulationOnly: true,
    risk: "low",
    reason:
      "Action interne autorisée. Simulation conservée par sécurité dans V10-020.",
  };
}
