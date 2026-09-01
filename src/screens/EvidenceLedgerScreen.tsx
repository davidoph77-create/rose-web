import React, {
  useCallback,
  useEffect,
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

export default function EvidenceLedgerScreen() {
  const [
    entries,
    setEntries,
  ] = useState<EvidenceLedgerEntry[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

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

  const verified =
    entries.filter(
      (item) =>
        item.status === "verified"
    ).length;

  const failed =
    entries.filter(
      (item) =>
        item.status === "failed"
    ).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Evidence Ledger V10
      </Text>

      <Text style={styles.subtitle}>
        Journal local des preuves créées après
        les vérifications Sandbox. Chaque entrée
        contient un hash d'intégrité et confirme
        qu'aucune exécution externe réelle n'a
        été détectée.
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
          label="Échecs"
          value={failed}
        />
      </View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={charger}
      >
        <Text style={styles.buttonText}>
          {loading
            ? "Chargement..."
            : "Actualiser les preuves"}
        </Text>
      </TouchableOpacity>

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
          {entries.map((item) => (
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

                <View style={styles.safeBadge}>
                  <Text style={styles.safeBadgeText}>
                    EXTERNE : NON
                  </Text>
                </View>
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
                Aucune exécution externe réelle
                détectée.
              </Text>
            </View>
          ))}
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
  refreshButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1d4ed8",
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
  safeBadge: {
    backgroundColor: "#172554",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  safeBadgeText: {
    color: "#bfdbfe",
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
