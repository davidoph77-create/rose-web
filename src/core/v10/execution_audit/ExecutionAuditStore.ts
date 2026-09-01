import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ExecutionAuditEntry,
} from "./ExecutionPolicyTypes";

const KEY =
  "rose_v10_execution_audit_v1";

export async function listExecutionAudit(): Promise<
  ExecutionAuditEntry[]
> {
  try {
    const raw =
      await AsyncStorage.getItem(KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export async function appendExecutionAudit(
  entry: ExecutionAuditEntry
) {
  const current =
    await listExecutionAudit();

  const next = [
    entry,
    ...current,
  ].slice(0, 200);

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(next)
  );

  return next;
}
