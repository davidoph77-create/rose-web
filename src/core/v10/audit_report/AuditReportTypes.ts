export type AuditReportRisk =
  | "low"
  | "medium"
  | "high";

export type AuditReportEntry = {
  evidenceId: string;
  createdAt: string;
  adapterId: string;
  capability: string;
  verificationStatus: string;
  integrityHash: string;
  externalExecutionDetected: boolean;
  risk: AuditReportRisk;
};

export type AuditReport = {
  id: string;
  generatedAt: string;
  totalEvidence: number;
  verifiedEvidence: number;
  failedEvidence: number;
  alteredEvidence: number;
  externalExecutionDetected: boolean;
  overallRisk: AuditReportRisk;
  entries: AuditReportEntry[];
  summary: string;
};
