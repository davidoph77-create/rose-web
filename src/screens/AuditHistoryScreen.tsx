import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

type AuditReport = {
  id?: string;
  createdAt?: string;
  riskLevel?: RiskLevel | string;
  totalEvidence?: number;
  verifiedEvidence?: number;
  failedEvidence?: number;
  alteredEvidence?: number;
  externalExecutionDetected?: boolean;
  adapterId?: string;
  capability?: string;
  integrityRate?: number;
  summary?: string;
  text?: string;
  hashes?: string[];
  [key: string]: any;
};

type HealthBand = "HEALTHY" | "WATCH" | "HIGH_RISK";

const AUDIT_KEYS = [
  "rose_v10_audit_reports",
  "rose_v10_audits",
  "rose.audit.reports",
  "rose.audit.history",
];

function normalizeRisk(value: any): RiskLevel {
  const v = String(value ?? "LOW").toUpperCase();
  if (v.includes("HIGH")) return "HIGH";
  if (v.includes("MED")) return "MEDIUM";
  return "LOW";
}

function getDateValue(value: any): number {
  const t = new Date(value ?? 0).getTime();
  return Number.isFinite(t) ? t : 0;
}

function getIntegrity(report: AuditReport): number {
  if (typeof report.integrityRate === "number") {
    return Math.max(0, Math.min(100, Math.round(report.integrityRate)));
  }
  const total = Number(report.totalEvidence ?? 0);
  const verified = Number(report.verifiedEvidence ?? 0);
  const failed = Number(report.failedEvidence ?? 0);
  const altered = Number(report.alteredEvidence ?? 0);

  if (total > 0) {
    const good = Math.max(0, total - failed - altered);
    const base = verified > 0 ? verified : good;
    return Math.max(0, Math.min(100, Math.round((base / total) * 100)));
  }

  if (altered > 0 || failed > 0 || report.externalExecutionDetected) return 0;
  return 100;
}

function DashboardCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <View style={styles.dashboardCard}>
      <Text style={styles.dashboardValue}>{value}</Text>
      <Text style={styles.dashboardLabel}>{label}</Text>
      {!!note && <Text style={styles.dashboardNote}>{note}</Text>}
    </View>
  );
}

function MiniBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const width = max <= 0 ? 0 : Math.max(4, Math.min(100, Math.round((value / max) * 100)));
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${width}%` }]} />
      </View>
      <Text style={styles.barValue}>{value}</Text>
    </View>
  );
}

export default function AuditHistoryScreen() {
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | RiskLevel>("ALL");
  const [selected, setSelected] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      let all: AuditReport[] = [];
      for (const key of AUDIT_KEYS) {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) all = all.concat(parsed);
          else if (parsed && Array.isArray(parsed.reports)) all = all.concat(parsed.reports);
        } catch {}
      }

      const seen = new Set<string>();
      const deduped = all.filter((item, idx) => {
        const id = String(
          item?.id ??
            `${item?.createdAt ?? "date"}-${item?.adapterId ?? "adapter"}-${idx}`
        );
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      deduped.sort((a, b) => getDateValue(b.createdAt) - getDateValue(a.createdAt));
      setReports(deduped);
    } catch (error: any) {
      Alert.alert("Audits", error?.message ?? "Impossible de charger les audits.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  const stats = useMemo(() => {
    const totalReports = reports.length;
    const totalEvidence = reports.reduce((s, r) => s + Number(r.totalEvidence ?? 0), 0);
    const verifiedEvidence = reports.reduce((s, r) => s + Number(r.verifiedEvidence ?? 0), 0);
    const failedEvidence = reports.reduce((s, r) => s + Number(r.failedEvidence ?? 0), 0);
    const alteredEvidence = reports.reduce((s, r) => s + Number(r.alteredEvidence ?? 0), 0);
    const externalDetected = reports.filter((r) => !!r.externalExecutionDetected).length;

    const integrityValues = reports.map(getIntegrity);
    const avgIntegrity =
      integrityValues.length > 0
        ? Math.round(integrityValues.reduce((a, b) => a + b, 0) / integrityValues.length)
        : 100;

    const low = reports.filter((r) => normalizeRisk(r.riskLevel) === "LOW").length;
    const medium = reports.filter((r) => normalizeRisk(r.riskLevel) === "MEDIUM").length;
    const high = reports.filter((r) => normalizeRisk(r.riskLevel) === "HIGH").length;

    const incidentCount = failedEvidence + alteredEvidence + externalDetected + high;

    let score = 100;
    score -= Math.min(40, failedEvidence * 8);
    score -= Math.min(40, alteredEvidence * 15);
    score -= Math.min(30, externalDetected * 20);
    score -= Math.min(25, high * 5);
    score -= Math.max(0, 100 - avgIntegrity) * 0.35;
    score = Math.max(0, Math.min(100, Math.round(score)));

    let band: HealthBand = "HEALTHY";
    if (score < 60 || externalDetected > 0 || alteredEvidence > 0) band = "HIGH_RISK";
    else if (score < 85 || failedEvidence > 0 || high > 0) band = "WATCH";

    return {
      totalReports,
      totalEvidence,
      verifiedEvidence,
      failedEvidence,
      alteredEvidence,
      externalDetected,
      avgIntegrity,
      low,
      medium,
      high,
      incidentCount,
      score,
      band,
    };
  }, [reports]);

  const recentTrend = useMemo(() => {
    const newest = reports.slice(0, 5).reverse();
    return newest.map((r, index) => ({
      id: String(r.id ?? index),
      integrity: getIntegrity(r),
      risk: normalizeRisk(r.riskLevel),
      createdAt: r.createdAt,
    }));
  }, [reports]);


  const connectorReadiness = useMemo(() => {
    const blockers: string[] = [];
    if (stats.score < 85) blockers.push("Health Score below 85");
    if (stats.alteredEvidence > 0) blockers.push("Altered evidence detected");
    if (stats.failedEvidence > 0) blockers.push("Verification failures present");
    if (stats.externalDetected > 0) blockers.push("External execution detected");
    if (stats.high > 0) blockers.push("HIGH risk report present");

    const ready = blockers.length === 0;
    return {
      calendarReady: ready,
      webReady: ready,
      blockers,
      safeToPrepareConnectors: ready,
    };
  }, [stats]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      const risk = normalizeRisk(r.riskLevel);
      if (riskFilter !== "ALL" && risk !== riskFilter) return false;
      if (!q) return true;
      const haystack = [
        r.id,
        r.adapterId,
        r.capability,
        r.summary,
        r.text,
        r.createdAt,
        ...(Array.isArray(r.hashes) ? r.hashes : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [reports, query, riskFilter]);

  const shareReport = async (report: AuditReport) => {
    const text =
      report.text ??
      `ROSE V10 - AUDIT\n\nID: ${report.id ?? "-"}\nRisk: ${normalizeRisk(
        report.riskLevel
      )}\nIntegrity: ${getIntegrity(report)}%\nExternal execution: ${
        report.externalExecutionDetected ? "YES" : "NO"
      }`;
    await Share.share({ message: text });
  };

  const healthLabel =
    stats.band === "HEALTHY"
      ? "SYSTEME SAIN"
      : stats.band === "WATCH"
      ? "A SURVEILLER"
      : "RISQUE ELEVE";

  const healthText =
    stats.band === "HEALTHY"
      ? "Integrite stable et aucun incident critique detecte."
      : stats.band === "WATCH"
      ? "Des signaux doivent etre surveilles avant toute activation externe."
      : "Blocage recommande. Verifier les preuves et les incidents avant de continuer.";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Audits V10</Text>
      <Text style={styles.subtitle}>
        Historique, integrite, tendances et score de sante du moteur V10.
      </Text>

      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <View>
            <Text style={styles.healthCaption}>Rose V10 Health Score</Text>
            <Text style={styles.healthScore}>{stats.score}/100</Text>
          </View>
          <View style={styles.healthBadge}>
            <Text style={styles.healthBadgeText}>{healthLabel}</Text>
          </View>
        </View>
        <Text style={styles.healthText}>{healthText}</Text>
        <View style={styles.healthTrack}>
          <View style={[styles.healthFill, { width: `${stats.score}%` }]} />
        </View>
      </View>

      <View style={styles.readinessCard}>
        <Text style={styles.sectionTitle}>Connector Readiness Gate</Text>
        <Text style={styles.sectionHint}>
          Prepares controlled Calendar and Web connectors. No real external action is enabled yet.
        </Text>

        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Agenda / Calendar</Text>
          <Text style={styles.readinessValue}>
            {connectorReadiness.calendarReady ? "READY FOR CONNECTION" : "BLOCKED"}
          </Text>
        </View>

        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Web</Text>
          <Text style={styles.readinessValue}>
            {connectorReadiness.webReady ? "READY FOR CONNECTION" : "BLOCKED"}
          </Text>
        </View>

        {connectorReadiness.blockers.length === 0 ? (
          <Text style={styles.readinessOk}>
            V10 is ready for controlled connector integration.
          </Text>
        ) : (
          <View style={styles.blockerBox}>
            <Text style={styles.blockerTitle}>Safety blockers:</Text>
            {connectorReadiness.blockers.map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.blockerText}>- {item}</Text>
            ))}
          </View>
        )}

        <Text style={styles.readinessSafety}>
          Real Calendar execution: DISABLED{"\n"}
          Real Web execution: DISABLED{"\n"}
          Human validation: REQUIRED
        </Text>
      </View>
      <View style={styles.calendarConnectorCard}>
        <Text style={styles.sectionTitle}>Calendar Controlled Connector</Text>
        <Text style={styles.sectionHint}>
          The Calendar execution path is now connected to Rose V10 safety controls.
          V10-037 only performs controlled dry-run validation.
        </Text>

        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Connector</Text>
          <Text style={styles.calendarConnectorValue}>CONNECTED / DRY-RUN</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Human approval</Text>
          <Text style={styles.calendarConnectorValue}>REQUIRED</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Release Gate</Text>
          <Text style={styles.calendarConnectorValue}>REQUIRED</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Evidence integrity</Text>
          <Text style={styles.calendarConnectorValue}>REQUIRED</Text>
        </View>

        <Text style={styles.calendarConnectorSafety}>
          Real Calendar write: DISABLED in V10-037{"\n"}
          Next step: inject the real calendar provider behind this safety gate.
        </Text>
      </View>
      <View style={styles.webConnectorCard}>
        <Text style={styles.sectionTitle}>Web Controlled Connector</Text>
        <Text style={styles.sectionHint}>
          The Web execution path is now connected to Rose V10 safety controls.
          V10-038 validates search/open/fetch requests in controlled dry-run only.
        </Text>

        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Connector</Text>
          <Text style={styles.webConnectorValue}>CONNECTED / DRY-RUN</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Human approval</Text>
          <Text style={styles.webConnectorValue}>REQUIRED</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Release Gate</Text>
          <Text style={styles.webConnectorValue}>REQUIRED</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Evidence integrity</Text>
          <Text style={styles.webConnectorValue}>REQUIRED</Text>
        </View>

        <Text style={styles.webConnectorSafety}>
          Real Web request: DISABLED in V10-038{"\n"}
          Calendar connector remains controlled. Real external execution is still blocked.
        </Text>
      </View>
      <View style={styles.googleOAuthCard}>
        <Text style={styles.sectionTitle}>Google OAuth Read-Only Connection</Text>
        <Text style={styles.sectionHint}>
          OAuth engine installed for Google Calendar read-only access.
          No client secret is stored in Rose and no Calendar write scope is requested.
        </Text>

        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>OAuth engine</Text>
          <Text style={styles.googleOAuthReady}>READY</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Google scope</Text>
          <Text style={styles.googleOAuthReady}>CALENDAR.READONLY</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Client ID</Text>
          <Text style={styles.googleOAuthPending}>TO CONFIGURE</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Calendar write</Text>
          <Text style={styles.googleOAuthPending}>DISABLED</Text>
        </View>

        <Text style={styles.googleOAuthSafety}>
          Next step: enter the Google OAuth Android client ID, then Rose can open
          the Google authorization screen and read upcoming events only.
        </Text>
      </View>
      <View style={styles.calendarReadOnlyCard}>
        <Text style={styles.sectionTitle}>Google Calendar Read-Only</Text>
        <Text style={styles.sectionHint}>
          The real Google Calendar provider is now implemented in read-only mode.
          OAuth authentication is intentionally not stored in the source code.
        </Text>

        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Provider</Text>
          <Text style={styles.calendarReadOnlyValue}>GOOGLE CALENDAR</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Capability</Text>
          <Text style={styles.calendarReadOnlyValue}>READ ONLY</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>OAuth</Text>
          <Text style={styles.calendarReadOnlyPending}>REQUIRED</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Calendar write</Text>
          <Text style={styles.calendarReadOnlyPending}>DISABLED</Text>
        </View>

        <Text style={styles.calendarReadOnlySafety}>
          V10-040 installs the real read-only Google Calendar provider code.
          The next sub-step will connect OAuth without enabling any write action.
        </Text>
      </View>
      <View style={styles.calendarProviderCard}>
        <Text style={styles.sectionTitle}>Real Calendar Provider Bridge</Text>
        <Text style={styles.sectionHint}>
          Rose now has a real provider interface behind the V10 Calendar safety gate.
          No external provider credentials are installed in V10-039.
        </Text>

        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Provider bridge</Text>
          <Text style={styles.calendarProviderValue}>READY</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Real provider</Text>
          <Text style={styles.calendarProviderValue}>NOT CONFIGURED</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>V10 safety gate</Text>
          <Text style={styles.calendarProviderValue}>REQUIRED</Text>
        </View>
        <View style={styles.readinessRow}>
          <Text style={styles.readinessLabel}>Write mode</Text>
          <Text style={styles.calendarProviderValue}>DRY-RUN ONLY</Text>
        </View>

        <Text style={styles.calendarProviderSafety}>
          V10-039 prepares the provider bridge only. No real Calendar event can be created yet.
        </Text>
      </View>
      <View style={styles.dashboardGrid}>
        <DashboardCard label="Rapports" value={stats.totalReports} />
        <DashboardCard label="Preuves" value={stats.totalEvidence} />
        <DashboardCard label="Integrite" value={`${stats.avgIntegrity}%`} />
        <DashboardCard label="Incidents" value={stats.incidentCount} />
        <DashboardCard label="Echecs" value={stats.failedEvidence} />
        <DashboardCard label="Alterees" value={stats.alteredEvidence} />
      </View>

      <View style={styles.securityCard}>
        <Text style={styles.sectionTitle}>Tendances recentes</Text>
        <Text style={styles.sectionHint}>
          Cinq audits les plus recents. La barre represente le taux d'integrite.
        </Text>
        {recentTrend.length === 0 ? (
          <Text style={styles.empty}>Aucun audit pour le moment.</Text>
        ) : (
          recentTrend.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.trendRow}>
              <View style={styles.trendTop}>
                <Text style={styles.trendIndex}>#{index + 1}</Text>
                <Text style={styles.trendRisk}>{item.risk}</Text>
                <Text style={styles.trendDate}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                </Text>
              </View>
              <View style={styles.trendTrack}>
                <View
                  style={[styles.trendFill, { width: `${Math.max(0, Math.min(100, item.integrity))}%` }]}
                />
              </View>
              <Text style={styles.trendIntegrity}>{item.integrity}%</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.securityCard}>
        <Text style={styles.sectionTitle}>Repartition du risque</Text>
        <MiniBar label="LOW" value={stats.low} max={Math.max(1, stats.totalReports)} />
        <MiniBar label="MEDIUM" value={stats.medium} max={Math.max(1, stats.totalReports)} />
        <MiniBar label="HIGH" value={stats.high} max={Math.max(1, stats.totalReports)} />
        <Text style={styles.securityText}>
          Execution externe detectee : {stats.externalDetected > 0 ? "OUI" : "NON"}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={loadReports}>
          <Text style={styles.primaryButtonText}>
            {loading ? "Chargement..." : "Actualiser"}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher id, adapter, capability, hash..."
        placeholderTextColor="#64748b"
        style={styles.search}
      />

      <View style={styles.filters}>
        {(["ALL", "LOW", "MEDIUM", "HIGH"] as const).map((risk) => (
          <TouchableOpacity
            key={risk}
            onPress={() => setRiskFilter(risk)}
            style={[styles.filterButton, riskFilter === risk && styles.filterButtonActive]}
          >
            <Text
              style={[
                styles.filterButtonText,
                riskFilter === risk && styles.filterButtonTextActive,
              ]}
            >
              {risk === "ALL" ? "TOUS" : risk}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.resultCount}>{filtered.length} rapport(s)</Text>

      {filtered.map((report, index) => {
        const risk = normalizeRisk(report.riskLevel);
        const integrity = getIntegrity(report);
        return (
          <TouchableOpacity
            key={String(report.id ?? `${report.createdAt ?? "audit"}-${index}`)}
            style={styles.reportCard}
            onPress={() => setSelected(report)}
          >
            <View style={styles.reportTop}>
              <Text style={styles.reportId}>{report.id ?? `Audit ${index + 1}`}</Text>
              <Text style={styles.riskBadge}>{risk}</Text>
            </View>
            <Text style={styles.reportMeta}>
              {report.createdAt ? new Date(report.createdAt).toLocaleString() : "Date inconnue"}
            </Text>
            <Text style={styles.reportMeta}>
              Adapter : {report.adapterId ?? "-"} | Capability : {report.capability ?? "-"}
            </Text>
            <Text style={styles.reportMeta}>Integrite : {integrity}%</Text>
          </TouchableOpacity>
        );
      })}

      {!!selected && (
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Detail du rapport</Text>
          <Text style={styles.detailLine}>ID : {selected.id ?? "-"}</Text>
          <Text style={styles.detailLine}>Risque : {normalizeRisk(selected.riskLevel)}</Text>
          <Text style={styles.detailLine}>Integrite : {getIntegrity(selected)}%</Text>
          <Text style={styles.detailLine}>
            Execution externe : {selected.externalExecutionDetected ? "OUI" : "NON"}
          </Text>
          <Text style={styles.detailLine}>Adapter : {selected.adapterId ?? "-"}</Text>
          <Text style={styles.detailLine}>Capability : {selected.capability ?? "-"}</Text>
          {!!selected.summary && <Text style={styles.detailText}>{selected.summary}</Text>}
          {!!selected.text && <Text style={styles.detailText}>{selected.text}</Text>}

          <View style={styles.detailActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => shareReport(selected)}>
              <Text style={styles.secondaryButtonText}>Partager</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setSelected(null)}>
              <Text style={styles.secondaryButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80,
    backgroundColor: "#070b16",
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 6,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  healthCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  healthCaption: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
  },
  healthScore: {
    color: "#f9a8d4",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 2,
  },
  healthBadge: {
    backgroundColor: "#1e293b",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  healthBadgeText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "900",
  },
  healthText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  healthTrack: {
    height: 10,
    backgroundColor: "#1e293b",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 12,
  },
  healthFill: {
    height: "100%",
    backgroundColor: "#f472b6",
    borderRadius: 999,
  },
  dashboardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  dashboardCard: {
    width: "31%",
    minWidth: 98,
    flexGrow: 1,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  dashboardValue: {
    color: "#f9a8d4",
    fontSize: 24,
    fontWeight: "900",
  },
  dashboardLabel: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
    textAlign: "center",
  },
  dashboardNote: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 3,
  },
  securityCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  sectionHint: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  securityText: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 8,
  },
  trendRow: {
    marginBottom: 12,
  },
  trendTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  trendIndex: {
    color: "#f9a8d4",
    fontWeight: "900",
    width: 28,
  },
  trendRisk: {
    color: "#f8fafc",
    fontWeight: "900",
    width: 64,
  },
  trendDate: {
    color: "#64748b",
    fontSize: 10,
    flex: 1,
    textAlign: "right",
  },
  trendTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#1e293b",
    overflow: "hidden",
  },
  trendFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#60a5fa",
  },
  trendIntegrity: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 3,
    textAlign: "right",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 5,
  },
  barLabel: {
    color: "#cbd5e1",
    width: 62,
    fontSize: 11,
    fontWeight: "800",
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#1e293b",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#a78bfa",
    borderRadius: 999,
  },
  barValue: {
    color: "#f8fafc",
    width: 28,
    textAlign: "right",
    fontSize: 11,
    fontWeight: "800",
  },
  readinessCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  readinessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  readinessLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800",
  },
  readinessValue: {
    color: "#f9a8d4",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
  },
  readinessOk: {
    color: "#86efac",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    fontWeight: "800",
  },
  blockerBox: {
    marginTop: 12,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 10,
  },
  blockerTitle: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 5,
  },
  blockerText: {
    color: "#cbd5e1",
    fontSize: 11,
    lineHeight: 17,
  },
  readinessSafety: {
    color: "#94a3b8",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
  },
  calendarConnectorCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  calendarConnectorValue: {
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
  },
  calendarConnectorSafety: {
    color: "#fbbf24",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
    fontWeight: "700",
  },
  webConnectorCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#7c3aed",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  webConnectorValue: {
    color: "#c4b5fd",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
  },
  webConnectorSafety: {
    color: "#fbbf24",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
    fontWeight: "700",
  },
  googleOAuthCard: {
    backgroundColor: "#0d1526",
    borderWidth: 1,
    borderColor: "#34d399",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  googleOAuthReady: {
    color: "#6ee7b7",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
  },
  googleOAuthPending: {
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
  },
  googleOAuthSafety: {
    color: "#cbd5e1",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
    fontWeight: "700",
  },
  calendarReadOnlyCard: {
    backgroundColor: "#0b1220",
    borderWidth: 1,
    borderColor: "#60a5fa",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  calendarReadOnlyValue: {
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
  },
  calendarReadOnlyPending: {
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
  },
  calendarReadOnlySafety: {
    color: "#cbd5e1",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
    fontWeight: "700",
  },
  calendarProviderCard: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#22c55e",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  calendarProviderValue: {
    color: "#86efac",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
  },
  calendarProviderSafety: {
    color: "#fbbf24",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  search: {
    backgroundColor: "#111827",
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterButtonActive: {
    backgroundColor: "#be185d",
    borderColor: "#f472b6",
  },
  filterButtonText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  resultCount: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 8,
  },
  reportCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  reportTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  reportId: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "900",
    flex: 1,
  },
  riskBadge: {
    color: "#f9a8d4",
    fontSize: 11,
    fontWeight: "900",
  },
  reportMeta: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 5,
  },
  detailCard: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 18,
    padding: 14,
    marginTop: 4,
  },
  detailLine: {
    color: "#cbd5e1",
    fontSize: 12,
    marginBottom: 5,
  },
  detailText: {
    color: "#e2e8f0",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  detailActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  secondaryButton: {
    backgroundColor: "#334155",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: "#f8fafc",
    fontWeight: "800",
    fontSize: 12,
  },
  empty: {
    color: "#64748b",
    fontSize: 12,
  },
});
