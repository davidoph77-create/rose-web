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
import {
  createEvidenceFromVerification,
} from "../evidence_ledger";

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
      evidence: null,
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

  const evidence =
    await createEvidenceFromVerification(
      verification
    );

  return {
    invocation,
    verification,
    evidence,
    summary:
      `${invocation.summary} ` +
      `${verification.summary} ` +
      `${evidence.summary}`,
  };
}
