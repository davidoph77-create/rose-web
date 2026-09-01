import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { listAuditReports, formatAuditReport } from "../core/v10/audit_report";
import type { AuditReport } from "../core/v10/audit_report";

export default function AuditHistoryScreen() {
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [selected, setSelected] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAuditReports();
      setReports(data);
      if (selected && !data.find((item) => item.id === selected.id)) {
        setSelected(null);
      }
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => { charger(); }, []);

  const low = reports.filter((r) => r.overallRisk === "low").length;
  const medium = reports.filter((r) => r.overallRisk === "medium").length;
  const high = reports.filter((r) => r.overallRisk === "high").length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique Audit V10</Text>
      <Text style={styles.subtitle}>
        V10-031 conserve et affiche les rapports d'audit générés par Rose.
        Tu peux ouvrir chaque rapport pour revoir les preuves, le niveau de risque
        et le résultat de sécurité enregistré.
      </Text>

      <View style={styles.stats}>
        <Stat label="LOW" value={low} />
        <Stat label="MEDIUM" value={medium} />
        <Stat label="HIGH" value={high} />
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={charger}>
        <Text style={styles.buttonText}>
          {loading ? "Chargement..." : "Actualiser l'historique"}
        </Text>
      </TouchableOpacity>

      {selected ? (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>Détail du rapport</Text>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.reportText}>{formatAuditReport(selected)}</Text>
          <Text style={styles.sectionTitle}>Entrées</Text>
          {selected.entries.map((entry) => (
            <View key={entry.evidenceId} style={styles.entryCard}>
              <Text style={styles.entryAdapter}>{entry.adapterId}</Text>
              <Text style={styles.entryText}>Capacité : {entry.capability}</Text>
              <Text style={styles.entryText}>Statut : {entry.verificationStatus}</Text>
              <Text style={styles.entryText}>Risque : {entry.risk.toUpperCase()}</Text>
              <Text style={styles.hash}>{entry.integrityHash}</Text>
              <Text style={styles.safeNotice}>
                Exécution externe : {entry.externalExecutionDetected ? "OUI" : "NON"}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {reports.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucun rapport d'audit enregistré.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {reports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.card}
              onPress={() => setSelected(report)}
            >
              <View style={styles.topRow}>
                <View style={[
                  styles.riskBadge,
                  report.overallRisk === "medium" && styles.riskMedium,
                  report.overallRisk === "high" && styles.riskHigh
                ]}>
                  <Text style={styles.riskText}>{report.overallRisk.toUpperCase()}</Text>
                </View>
                <Text style={styles.date}>{new Date(report.generatedAt).toLocaleString()}</Text>
              </View>
              <Text style={styles.reportId}>{report.id}</Text>
              <Text style={styles.summary}>{report.summary}</Text>
              <Text style={styles.meta}>
                Preuves : {report.totalEvidence} • Vérifiées : {report.verifiedEvidence}
              </Text>
              <Text style={styles.meta}>
                Échecs : {report.failedEvidence} • Altérées : {report.alteredEvidence}
              </Text>
              <Text style={styles.openText}>Ouvrir le rapport</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 20 },
  title: { color: "#f8fafc", fontSize: 22, fontWeight: "800", marginBottom: 6 },
  subtitle: { color: "#94a3b8", fontSize: 13, lineHeight: 19, marginBottom: 12 },
  stats: { flexDirection: "row", gap: 8, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: "#111827", borderWidth: 1, borderColor: "#1e293b", borderRadius: 14, padding: 10, alignItems: "center" },
  statValue: { color: "#f9a8d4", fontSize: 20, fontWeight: "900" },
  statLabel: { color: "#94a3b8", fontSize: 10, marginTop: 3 },
  refreshButton: { alignSelf: "flex-start", backgroundColor: "#1d4ed8", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
  buttonText: { color: "#ffffff", fontWeight: "800", fontSize: 12 },
  empty: { backgroundColor: "#111827", borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, padding: 18 },
  emptyText: { color: "#94a3b8" },
  list: { paddingBottom: 80 },
  card: { backgroundColor: "#111827", borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, padding: 14, marginBottom: 10 },
  topRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 8 },
  riskBadge: { backgroundColor: "#166534", borderRadius: 20, paddingVertical: 5, paddingHorizontal: 10 },
  riskMedium: { backgroundColor: "#92400e" },
  riskHigh: { backgroundColor: "#991b1b" },
  riskText: { color: "#ffffff", fontSize: 10, fontWeight: "900" },
  date: { color: "#64748b", fontSize: 10 },
  reportId: { color: "#93c5fd", fontSize: 12, fontWeight: "900", marginBottom: 7 },
  summary: { color: "#e2e8f0", fontSize: 12, lineHeight: 18, marginBottom: 8 },
  meta: { color: "#94a3b8", fontSize: 10, marginBottom: 3 },
  openText: { color: "#f9a8d4", fontSize: 11, fontWeight: "900", marginTop: 10 },
  detailCard: { backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#7c3aed", borderRadius: 16, padding: 14, marginBottom: 12 },
  detailHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  detailTitle: { color: "#c4b5fd", fontSize: 14, fontWeight: "900" },
  closeText: { color: "#f9a8d4", fontWeight: "900" },
  reportText: { color: "#e2e8f0", fontSize: 11, lineHeight: 17 },
  sectionTitle: { color: "#f8fafc", fontSize: 13, fontWeight: "900", marginTop: 14, marginBottom: 8 },
  entryCard: { backgroundColor: "#111827", borderRadius: 12, padding: 10, marginBottom: 8 },
  entryAdapter: { color: "#93c5fd", fontWeight: "900", marginBottom: 5 },
  entryText: { color: "#cbd5e1", fontSize: 10, marginBottom: 3 },
  hash: { color: "#f9a8d4", fontSize: 10, fontWeight: "800", marginTop: 5 },
  safeNotice: { color: "#86efac", fontSize: 10, marginTop: 6 },
});
