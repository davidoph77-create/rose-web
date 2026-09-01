import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ControlledExecutionResult,
} from "./ControlledActionTypes";

const KEY =
  "rose_v10_controlled_execution_log_v1";

export async function listControlledExecutionLog(): Promise<
  ControlledExecutionResult[]
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

export async function appendControlledExecutionLog(
  result: ControlledExecutionResult
) {
  const current =
    await listControlledExecutionLog();

  const next = [
    result,
    ...current,
  ].slice(0, 100);

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(next)
  );

  return next;
}
