import type {
  InvocationVerification,
} from "../invocation_verification/VerificationTypes";
import {
  buildEvidenceHash,
} from "./EvidenceHash";
import {
  appendEvidenceLedger,
} from "./EvidenceLedgerStore";

export async function createEvidenceFromVerification(
  verification: InvocationVerification
) {
  const payload =
    JSON.stringify({
      verificationId:
        verification.id,
      invocationId:
        verification.invocationId,
      adapterId:
        verification.adapterId,
      capability:
        verification.capability,
      status:
        verification.status,
      checks:
        verification.checks,
      externalExecutionDetected:
        verification.externalExecutionDetected,
      createdAt:
        verification.createdAt,
    });

  const integrityHash =
    buildEvidenceHash(payload);

  const entry = {
    id:
      `evidence_${Date.now()}_` +
      Math.random()
        .toString(36)
        .slice(2, 8),
    createdAt:
      new Date().toISOString(),
    verificationId:
      verification.id,
    invocationId:
      verification.invocationId,
    adapterId:
      verification.adapterId,
    capability:
      verification.capability,
    status:
      verification.status,
    integrityHash,
    payload,
    externalExecutionDetected:
      false as const,
  };

  await appendEvidenceLedger(
    entry
  );

  return {
    entry,
    summary:
      `Evidence Ledger : preuve enregistrée avec intégrité ${integrityHash}.`,
  };
}
