import type {
  AuditReport,
} from "./AuditReportTypes";

export function formatAuditReport(
  report: AuditReport
) {
  const lines = [
    "ROSE V10 - RAPPORT D'AUDIT",
    `Rapport : ${report.id}`,
    `Généré : ${report.generatedAt}`,
    "",
    `Preuves : ${report.totalEvidence}`,
    `Vérifiées : ${report.verifiedEvidence}`,
    `Échecs : ${report.failedEvidence}`,
    `Altérées : ${report.alteredEvidence}`,
    `Exécution externe détectée : ${
      report.externalExecutionDetected
        ? "OUI"
        : "NON"
    }`,
    `Risque global : ${report.overallRisk.toUpperCase()}`,
    "",
    report.summary,
  ];

  return lines.join("\n");
}
