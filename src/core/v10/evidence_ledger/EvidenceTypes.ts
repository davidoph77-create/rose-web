export type EvidenceStatus =
  | "verified"
  | "warning"
  | "failed";

export type EvidenceLedgerEntry = {
  id: string;
  createdAt: string;
  verificationId: string;
  invocationId: string;
  adapterId: string;
  capability: string;
  status: EvidenceStatus;
  integrityHash: string;
  payload: string;
  externalExecutionDetected: false;
};
