import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AdapterInvocationResult,
} from "./AdapterInvocationTypes";

const KEY =
  "rose_v10_adapter_invocation_log_v1";

export async function listAdapterInvocations(): Promise<
  AdapterInvocationResult[]
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

export async function appendAdapterInvocation(
  result: AdapterInvocationResult
) {
  const current =
    await listAdapterInvocations();

  const next = [
    result,
    ...current,
  ].slice(0, 200);

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(next)
  );

  return result;
}
