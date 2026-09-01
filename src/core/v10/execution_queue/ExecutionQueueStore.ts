import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ExecutionQueueItem,
} from "./ExecutionQueueTypes";

const KEY =
  "rose_v10_execution_queue_v1";

export async function listExecutionQueue(): Promise<
  ExecutionQueueItem[]
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

export async function enqueueExecutionItem(
  item: ExecutionQueueItem
) {
  const current =
    await listExecutionQueue();

  const withoutSameAction =
    current.filter(
      (existing) =>
        existing.actionId !== item.actionId
    );

  const next = [
    item,
    ...withoutSameAction,
  ].slice(0, 200);

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(next)
  );

  return next;
}

export async function updateExecutionQueueStatus(
  id: string,
  status:
    | "reviewed"
    | "cancelled"
) {
  const current =
    await listExecutionQueue();

  const next =
    current.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
          }
        : item
    );

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(next)
  );

  return next.find(
    (item) => item.id === id
  ) || null;
}
