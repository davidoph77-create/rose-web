import type {
  EvidenceLedgerEntry,
} from "./EvidenceTypes";
import {
  buildEvidenceHash,
} from "./EvidenceHash";

export type EvidenceIntegrityResult = {
  entryId: string;
  valid: boolean;
  expectedHash: string;
  storedHash: string;
  checkedAt: string;
  summary: string;
};

export function verifyEvidenceIntegrity(
  entry: EvidenceLedgerEntry
): EvidenceIntegrityResult {
  const expectedHash =
    buildEvidenceHash(entry.payload);

  const valid =
    expectedHash === entry.integrityHash;

  return {
    entryId: entry.id,
    valid,
    expectedHash,
    storedHash:
      entry.integrityHash,
    checkedAt:
      new Date().toISOString(),
    summary:
      valid
        ? `Intégrité OK : ${entry.integrityHash}`
        : `ALERTE : hash attendu ${expectedHash}, hash stocké ${entry.integrityHash}`,
  };
}
