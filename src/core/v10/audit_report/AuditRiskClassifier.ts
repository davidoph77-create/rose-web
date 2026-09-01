import type {
  AuditReportRisk,
} from "./AuditReportTypes";

export function classifyAuditRisk(params: {
  failedEvidence: number;
  alteredEvidence: number;
  externalExecutionDetected: boolean;
}): AuditReportRisk {
  if (
    params.externalExecutionDetected ||
    params.alteredEvidence > 0
  ) {
    return "high";
  }

  if (params.failedEvidence > 0) {
    return "medium";
  }

  return "low";
}
