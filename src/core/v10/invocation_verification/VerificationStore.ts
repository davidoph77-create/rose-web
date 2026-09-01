import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  InvocationVerification,
} from "./VerificationTypes";

const KEY =
  "rose_v10_invocation_verification_log_v1";

export async function listInvocationVerifications(): Promise<
  InvocationVerification[]
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

export async function appendInvocationVerification(
  verification: InvocationVerification
) {
  const current =
    await listInvocationVerifications();

  const next = [
    verification,
    ...current,
  ].slice(0, 200);

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(next)
  );

  return verification;
}
