import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ReleaseGateRecord,
} from "./ReleaseGateTypes";

const KEY =
  "rose_v10_release_gate_v1";

export async function listReleaseGateRecords(): Promise<
  ReleaseGateRecord[]
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

export async function upsertReleaseGateRecord(
  record: ReleaseGateRecord
) {
  const current =
    await listReleaseGateRecords();

  const withoutSameQueue =
    current.filter(
      (item) =>
        item.queueItemId !== record.queueItemId
    );

  const next = [
    record,
    ...withoutSameQueue,
  ].slice(0, 200);

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(next)
  );

  return record;
}

export async function updateReleaseGateStatus(
  queueItemId: string,
  status:
    | "release_confirmed"
    | "release_cancelled",
  confirmedBy = "David"
) {
  const current =
    await listReleaseGateRecords();

  const next =
    current.map((item) =>
      item.queueItemId === queueItemId
        ? {
            ...item,
            status,
            confirmedBy,
            confirmedAt:
              new Date().toISOString(),
          }
        : item
    );

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(next)
  );

  return (
    next.find(
      (item) =>
        item.queueItemId === queueItemId
    ) || null
  );
}
