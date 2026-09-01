import {
  StoredApprovalDecision,
} from "../approval_ui/ApprovalDecisionStore";
import {
  ControlledAction,
  ControlledActionKind,
  ControlledExecutionResult,
} from "./ControlledActionTypes";

export function buildControlledAction(
  decision: StoredApprovalDecision
): ControlledAction {
  const kind =
    normalizeKind(decision.intent);

  const external =
    kind === "calendar" ||
    kind === "web";

  const status =
    decision.status === "approved"
      ? "authorized"
      : decision.status === "rejected"
      ? "rejected"
      : "blocked";

  return {
    id:
      `action_${Date.now()}_` +
      Math.random()
        .toString(36)
        .slice(2, 8),
    createdAt:
      new Date().toISOString(),
    kind,
    message:
      decision.message,
    agent:
      decision.agents[0] ||
      "cognitive-agent",
    approvalId:
      decision.id,
    status,
    external,
    reason:
      status === "authorized"
        ? "Action autorisée par décision humaine."
        : status === "rejected"
        ? "Action refusée par décision humaine."
        : "Action en attente d'une décision humaine.",
  };
}

export function executeControlledAction(
  action: ControlledAction
): ControlledExecutionResult {
  if (action.status === "rejected") {
    return {
      action,
      executedExternally: false,
      simulated: false,
      summary:
        "Action annulée : la décision humaine est REFUSÉE.",
    };
  }

  if (action.status !== "authorized") {
    return {
      action,
      executedExternally: false,
      simulated: false,
      summary:
        "Action bloquée : une approbation humaine est requise.",
    };
  }

  // V10-019 : simulation uniquement.
  // Aucune action Web/Calendar réelle n'est exécutée ici.
  const simulatedAction: ControlledAction = {
    ...action,
    status: "simulated",
  };

  return {
    action:
      simulatedAction,
    executedExternally: false,
    simulated: true,
    summary:
      action.external
        ? `Action ${action.kind} autorisée puis simulée. Exécution externe réelle désactivée dans V10-019.`
        : `Action ${action.kind} autorisée et simulée dans le pipeline interne.`,
  };
}

function normalizeKind(
  intent: string
): ControlledActionKind {
  switch (intent) {
    case "calendar":
      return "calendar";
    case "web":
      return "web";
    case "business":
      return "business";
    case "memory":
      return "memory";
    case "planning":
    case "goal":
      return "planning";
    default:
      return "general";
  }
}
