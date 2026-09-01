import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  listEvidenceLedger,
} from "../core/v10/evidence_ledger";
import type {
  EvidenceLedgerEntry,
} from "../core/v10/evidence_ledger";
import {
  verifyEvidenceIntegrity,
} from "../core/v10/evidence_ledger/EvidenceIntegrityVerifier";
import {
  buildAuditReport,
  formatAuditReport,
  saveAuditReport,
} from "../core/v10/audit_report";
import type {
  AuditReport,
} from "../core/v10/audit_report";

type IntegrityMap = Record<
  string,
  {
    valid: boolean;
    summary: string;
  }
>;

export default function EvidenceLedgerScreen() {
  const [
    entries,
    setEntries,
  ] = useState<EvidenceLedgerEntry[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    integrity,
    setIntegrity,
  ] = useState<IntegrityMap>({});

  const [
    auditReport,
    setAuditReport,
  ] = useState<AuditReport | null>(null);

  const charger = useCallback(
    async () => {
      setLoading(true);

      try {
        const data =
          await listEvidenceLedger();

        setEntries(data);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    charger();
  }, [charger]);

  const verifierTout = () => {
    const next: IntegrityMap = {};

    for (const entry of entries) {
      const result =
        verifyEvidenceIntegrity(
          entry
        );

      next[entry.id] = {
        valid:
          result.valid,
        summary:
          result.summary,
      };
    }

    setIntegrity(next);
  };

  const genererAudit = async () => {
    const report =
      buildAuditReport(entries);

    await saveAuditReport(report);
    setAuditReport(report);
  };

  const integrityStats = useMemo(() => {
    const values =
      Object.values(integrity);

    return {
      checked:
        values.length,
      valid:
        values.filter(
          (item) =>
            item.valid
        ).length,
      invalid:
        values.filter(
          (item) =>
            !item.valid
        ).length,
    };
  }, [integrity]);

  const verified =
    entries.filter(
      (item) =>
        item.status === "verified"
    ).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Evidence Ledger V10
      </Text>

      <Text style={styles.subtitle}>
        V10-030 ajoute un moteur de rapport
        d'audit. Rose transforme maintenant
        les preuves du ledger en synthèse
        lisible avec intégrité, risque,
        validation et sécurité.
      </Text>

      <View style={styles.stats}>
        <Stat
          label="Preuves"
          value={entries.length}
        />
        <Stat
          label="Vérifiées"
          value={verified}
        />
        <Stat
          label="Altérées"
          value={integrityStats.invalid}
        />
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={charger}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "Chargement..."
              : "Actualiser"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={verifierTout}
        >
          <Text style={styles.buttonText}>
            Vérifier l'intégrité
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.auditButton}
        onPress={genererAudit}
      >
        <Text style={styles.buttonText}>
          Générer rapport d'audit
        </Text>
      </TouchableOpacity>

      {integrityStats.checked > 0 ? (
        <View
          style={[
            styles.integritySummary,
            integrityStats.invalid > 0 &&
              styles.integritySummaryAlert,
          ]}
        >
          <Text style={styles.integritySummaryText}>
            {integrityStats.invalid === 0
              ? `Intégrité OK : ${integrityStats.valid}/${integrityStats.checked} preuves valides.`
              : `ALERTE : ${integrityStats.invalid} preuve(s) altérée(s) détectée(s).`}
          </Text>
        </View>
      ) : null}

      {auditReport ? (
        <View
          style={[
            styles.auditCard,
            auditReport.overallRisk === "high" &&
              styles.auditCardHigh,
          ]}
        >
          <Text style={styles.auditTitle}>
            Audit Report Engine
          </Text>

          <Text style={styles.auditText}>
            {formatAuditReport(auditReport)}
          </Text>
        </View>
      ) : null}

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Aucune preuve enregistrée.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {entries.map((item) => {
            const check =
              integrity[item.id];

            return (
              <View
                key={item.id}
                style={styles.card}
              >
                <View style={styles.topRow}>
                  <View
                    style={[
                      styles.badge,
                      item.status ===
                        "failed" &&
                        styles.badgeFailed,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {item.status === "verified"
                        ? "VÉRIFIÉE"
                        : item.status.toUpperCase()}
                    </Text>
                  </View>

                  {check ? (
                    <View
                      style={[
                        styles.integrityBadge,
                        !check.valid &&
                          styles.integrityBadgeBad,
                      ]}
                    >
                      <Text
                        style={styles.integrityBadgeText}
                      >
                        {check.valid
                          ? "HASH OK"
                          : "HASH ALTÉRÉ"}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.adapter}>
                  {item.adapterId}
                </Text>

                <Text style={styles.capability}>
                  Capacité : {item.capability}
                </Text>

                <Text style={styles.hashLabel}>
                  Hash d'intégrité
                </Text>

                <Text style={styles.hash}>
                  {item.integrityHash}
                </Text>

                {check ? (
                  <Text
                    style={[
                      styles.checkText,
                      !check.valid &&
                        styles.checkTextBad,
                    ]}
                  >
                    {check.summary}
                  </Text>
                ) : null}

                <Text style={styles.meta}>
                  Verification ID :{" "}
                  {item.verificationId}
                </Text>

                <Text style={styles.meta}>
                  Invocation ID :{" "}
                  {item.invocationId}
                </Text>

                <Text style={styles.date}>
                  Créée :{" "}
                  {new Date(
                    item.createdAt
                  ).toLocaleString()}
                </Text>

                <Text style={styles.notice}>
                  Exécution externe détectée : NON
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value}
      </Text>
      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  stats: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
  },
  statValue: {
    color: "#f9a8d4",
    fontSize: 20,
    fontWeight: "900",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 3,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  refreshButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  verifyButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  auditButton: {
    alignSelf: "flex-start",
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
  },
  integritySummary: {
    backgroundColor: "#14532d",
    borderWidth: 1,
    borderColor: "#22c55e",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  integritySummaryAlert: {
    backgroundColor: "#7f1d1d",
    borderColor: "#ef4444",
  },
  integritySummaryText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  auditCard: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#14b8a6",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  auditCardHigh: {
    borderColor: "#ef4444",
  },
  auditTitle: {
    color: "#5eead4",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 7,
  },
  auditText: {
    color: "#e2e8f0",
    fontSize: 11,
    lineHeight: 17,
  },
  empty: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
  },
  emptyText: {
    color: "#94a3b8",
  },
  list: {
    paddingBottom: 60,
  },
  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "#166534",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  badgeFailed: {
    backgroundColor: "#991b1b",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
  },
  integrityBadge: {
    backgroundColor: "#0f766e",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  integrityBadgeBad: {
    backgroundColor: "#991b1b",
  },
  integrityBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
  },
  adapter: {
    color: "#93c5fd",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 5,
  },
  capability: {
    color: "#e2e8f0",
    fontSize: 12,
    marginBottom: 10,
  },
  hashLabel: {
    color: "#f9a8d4",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  hash: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
  },
  checkText: {
    color: "#86efac",
    fontSize: 11,
    marginBottom: 10,
  },
  checkTextBad: {
    color: "#fca5a5",
  },
  meta: {
    color: "#94a3b8",
    fontSize: 10,
    marginBottom: 3,
  },
  date: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 5,
  },
  notice: {
    color: "#86efac",
    fontSize: 11,
    marginTop: 10,
  },
});
