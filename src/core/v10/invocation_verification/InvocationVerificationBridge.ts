import type {
  ReleaseGateRecord,
} from "../release_gate/ReleaseGateTypes";
import {
  invokeConfirmedReleaseInSandbox,
} from "../adapter_invocation";
import {
  verifyAdapterInvocation,
} from "./InvocationVerifier";
import {
  appendInvocationVerification,
} from "./VerificationStore";

export async function invokeAndVerifyRelease(
  record: ReleaseGateRecord
) {
  const invocation =
    await invokeConfirmedReleaseInSandbox(
      record
    );

  if (!invocation.result) {
    return {
      invocation,
      verification: null,
      summary:
        invocation.summary,
    };
  }

  const verification =
    verifyAdapterInvocation(
      invocation.result
    );

  await appendInvocationVerification(
    verification
  );

  return {
    invocation,
    verification,
    summary:
      `${invocation.summary} ${verification.summary}`,
  };
}
