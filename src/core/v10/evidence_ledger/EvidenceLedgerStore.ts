import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  EvidenceLedgerEntry,
} from "./EvidenceTypes";

const KEY =
  "rose_v10_evidence_ledger_v1";

export async function listEvidenceLedger(): Promise<
  EvidenceLedgerEntry[]
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

export async function appendEvidenceLedger(
  entry: EvidenceLedgerEntry
) {
  const current =
    await listEvidenceLedger();

  const next = [
    entry,
    ...current,
  ].slice(0, 300);

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(next)
  );

  return entry;
}
