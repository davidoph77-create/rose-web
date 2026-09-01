import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoredApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export type StoredApprovalDecision = {
  id: string;
  createdAt: string;
  updatedAt: string;
  message: string;
  intent: string;
  agents: string[];
  status: StoredApprovalStatus;
  decidedBy?: string;
  note?: string;
};

const STORAGE_KEY =
  "rose_v10_approval_decisions_v1";

async function readAll(): Promise<
  StoredApprovalDecision[]
> {
  try {
    const raw =
      await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.log(
      "[Rose V10-017] ApprovalStore read error:",
      error
    );
    return [];
  }
}

async function writeAll(
  decisions: StoredApprovalDecision[]
) {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(decisions)
  );
}

export async function listApprovalDecisions() {
  return readAll();
}

export async function recordApprovalRequest(input: {
  message: string;
  intent?: string;
  agents?: string[];
}) {
  const message = input.message.trim();

  if (!message) return null;

  const current = await readAll();

  const existing = current.find(
    (item) =>
      item.status === "pending" &&
      item.message.trim().toLowerCase() ===
        message.toLowerCase()
  );

  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();

  const decision: StoredApprovalDecision = {
    id:
      `approval_${Date.now()}_` +
      Math.random()
        .toString(36)
        .slice(2, 8),
    createdAt: now,
    updatedAt: now,
    message,
    intent:
      input.intent || "general",
    agents:
      Array.isArray(input.agents)
        ? input.agents
        : [],
    status: "pending",
  };

  await writeAll([
    decision,
    ...current,
  ]);

  return decision;
}

export async function setApprovalDecisionStatus(
  id: string,
  status: "approved" | "rejected",
  decidedBy = "David",
  note?: string
) {
  const current = await readAll();

  const updated =
    current.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            decidedBy,
            note,
            updatedAt:
              new Date().toISOString(),
          }
        : item
    );

  await writeAll(updated);

  return updated.find(
    (item) => item.id === id
  );
}

export async function clearResolvedApprovals() {
  const current = await readAll();

  const pending = current.filter(
    (item) =>
      item.status === "pending"
  );

  await writeAll(pending);

  return pending;
}
