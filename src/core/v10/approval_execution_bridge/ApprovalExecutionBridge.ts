import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StoredApprovalDecision,
  listApprovalDecisions,
} from "../approval_ui/ApprovalDecisionStore";

export type ApprovalBridgeState = {
  approved: StoredApprovalDecision[];
  rejected: StoredApprovalDecision[];
  pending: StoredApprovalDecision[];
  lastSyncAt: string;
};

const BRIDGE_KEY =
  "rose_v10_approval_execution_bridge_v1";

export async function syncApprovalExecutionBridge(): Promise<ApprovalBridgeState> {
  const decisions =
    await listApprovalDecisions();

  const state: ApprovalBridgeState = {
    approved: decisions.filter(
      (item) => item.status === "approved"
    ),
    rejected: decisions.filter(
      (item) => item.status === "rejected"
    ),
    pending: decisions.filter(
      (item) => item.status === "pending"
    ),
    lastSyncAt:
      new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    BRIDGE_KEY,
    JSON.stringify(state)
  );

  return state;
}

export async function readApprovalExecutionBridge(): Promise<ApprovalBridgeState> {
  try {
    const raw =
      await AsyncStorage.getItem(BRIDGE_KEY);

    if (!raw) {
      return syncApprovalExecutionBridge();
    }

    const parsed = JSON.parse(raw);

    return {
      approved:
        Array.isArray(parsed.approved)
          ? parsed.approved
          : [],
      rejected:
        Array.isArray(parsed.rejected)
          ? parsed.rejected
          : [],
      pending:
        Array.isArray(parsed.pending)
          ? parsed.pending
          : [],
      lastSyncAt:
        typeof parsed.lastSyncAt === "string"
          ? parsed.lastSyncAt
          : new Date().toISOString(),
    };
  } catch {
    return syncApprovalExecutionBridge();
  }
}

export async function getLatestApprovalForMessage(
  message: string
) {
  const state =
    await syncApprovalExecutionBridge();

  const normalized =
    message.trim().toLowerCase();

  const all = [
    ...state.approved,
    ...state.rejected,
    ...state.pending,
  ].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  return (
    all.find(
      (item) =>
        item.message
          .trim()
          .toLowerCase() === normalized
    ) || null
  );
}

export function summarizeBridgeDecision(
  decision: StoredApprovalDecision | null
) {
  if (!decision) {
    return {
      status: "none",
      text:
        "Aucune décision humaine liée n'a encore été enregistrée.",
    };
  }

  if (decision.status === "approved") {
    return {
      status: "approved",
      text:
        "Décision humaine reconnue : APPROUVÉE. Le pipeline V10 peut considérer l'action comme autorisée en interne, mais aucune action externe réelle n'est exécutée dans V10-018.",
    };
  }

  if (decision.status === "rejected") {
    return {
      status: "rejected",
      text:
        "Décision humaine reconnue : REFUSÉE. Le pipeline V10 doit considérer l'action comme annulée.",
    };
  }

  return {
    status: "pending",
    text:
      "Décision humaine reconnue : EN ATTENTE. Le pipeline V10 reste bloqué.",
  };
}
