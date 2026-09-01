import type {
  EvidenceLedgerEntry,
} from "../evidence_ledger";
import {
  verifyEvidenceIntegrity,
} from "../evidence_ledger/EvidenceIntegrityVerifier";
import {
  classifyAuditRisk,
} from "./AuditRiskClassifier";
import type {
  AuditReport,
  AuditReportEntry,
} from "./AuditReportTypes";

export function buildAuditReport(
  evidence: EvidenceLedgerEntry[]
): AuditReport {
  let verifiedEvidence = 0;
  let failedEvidence = 0;
  let alteredEvidence = 0;
  let externalExecutionDetected = false;

  const entries: AuditReportEntry[] =
    evidence.map((item) => {
      const integrity =
        verifyEvidenceIntegrity(item);

      if (item.status === "verified") {
        verifiedEvidence += 1;
      }

      if (item.status === "failed") {
        failedEvidence += 1;
      }

      if (!integrity.valid) {
        alteredEvidence += 1;
      }

      if (
        item.externalExecutionDetected === true
      ) {
        externalExecutionDetected = true;
      }

      const risk =
        item.externalExecutionDetected
          ? "high"
          : !integrity.valid
          ? "high"
          : item.status === "failed"
          ? "medium"
          : "low";

      return {
        evidenceId: item.id,
        createdAt: item.createdAt,
        adapterId: item.adapterId,
        capability: item.capability,
        verificationStatus:
          item.status,
        integrityHash:
          item.integrityHash,
        externalExecutionDetected:
          item.externalExecutionDetected,
        risk,
      };
    });

  const overallRisk =
    classifyAuditRisk({
      failedEvidence,
      alteredEvidence,
      externalExecutionDetected,
    });

  return {
    id:
      `audit_${Date.now()}_` +
      Math.random()
        .toString(36)
        .slice(2, 8),
    generatedAt:
      new Date().toISOString(),
    totalEvidence:
      evidence.length,
    verifiedEvidence,
    failedEvidence,
    alteredEvidence,
    externalExecutionDetected,
    overallRisk,
    entries,
    summary:
      overallRisk === "low"
        ? `Audit OK : ${verifiedEvidence}/${evidence.length} preuves vérifiées, aucune altération et aucune exécution externe détectée.`
        : overallRisk === "medium"
        ? `Audit avec avertissement : ${failedEvidence} preuve(s) en échec, aucune exécution externe détectée.`
        : `ALERTE audit : altération ou exécution externe détectée.`,
  };
}
