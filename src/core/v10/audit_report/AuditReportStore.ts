import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  AuditReport,
} from "./AuditReportTypes";

const KEY =
  "rose_v10_audit_reports_v1";

export async function listAuditReports(): Promise<
  AuditReport[]
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

export async function saveAuditReport(
  report: AuditReport
) {
  const current =
    await listAuditReports();

  const next = [
    report,
    ...current,
  ].slice(0, 100);

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(next)
  );

  return report;
}
