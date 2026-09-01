import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  clearResolvedApprovals,
  listApprovalDecisions,
  setApprovalDecisionStatus,
  StoredApprovalDecision,
} from "../core/v10/approval_ui/ApprovalDecisionStore";
import {
  syncApprovalExecutionBridge,
} from "../core/v10/approval_execution_bridge";
import {
  processDecisionToExecutionQueue,
} from "../core/v10/execution_queue";

export default function ApprovalScreen() {
  const [
    decisions,
    setDecisions,
  ] = useState<
    StoredApprovalDecision[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    executionMessage,
    setExecutionMessage,
  ] = useState("");

  const charger = useCallback(
    async () => {
      setLoading(true);

      try {
        const data =
          await listApprovalDecisions();

        setDecisions(data);
        await syncApprovalExecutionBridge();
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    charger();
  }, [charger]);

  const changerStatut = async (
    id: string,
    status:
      | "approved"
      | "rejected"
  ) => {
    const decision =
      await setApprovalDecisionStatus(
        id,
        status,
        "David"
      );

    await syncApprovalExecutionBridge();

    if (decision) {
      const result =
        await processDecisionToExecutionQueue(
          decision
        );

      setExecutionMessage(
        result.summary
      );
    }

    await charger();
  };

  const nettoyer = () => {
    Alert.alert(
      "Nettoyer l'historique",
      "Supprimer uniquement les validations déjà approuvées ou refusées ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Nettoyer",
          style: "destructive",
          onPress: async () => {
            await clearResolvedApprovals();
            await syncApprovalExecutionBridge();
            setExecutionMessage("");
            await charger();
          },
        },
      ]
    );
  };

  const pending =
    decisions.filter(
      (item) =>
        item.status === "pending"
    ).length;

  const approved =
    decisions.filter(
      (item) =>
        item.status === "approved"
    ).length;

  const rejected =
    decisions.filter(
      (item) =>
        item.status === "rejected"
    ).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Validations V10
      </Text>

      <Text style={styles.subtitle}>
        V10-021 ajoute une file d'exécution
        simulée et une étape Dry Run Review.
        Toute action externe réelle reste
        désactivée.
      </Text>

      {executionMessage ? (
        <View style={styles.executionCard}>
          <Text style={styles.executionTitle}>
            Execution Queue / Dry Run
          </Text>
          <Text style={styles.executionText}>
            {executionMessage}
          </Text>
        </View>
      ) : null}

      <View style={styles.stats}>
        <Stat label="En attente" value={pending} />
        <Stat label="Approuvées" value={approved} />
        <Stat label="Refusées" value={rejected} />
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={charger}
        >
          <Text style={styles.buttonText}>
            {loading ? "Chargement..." : "Actualiser"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cleanButton}
          onPress={nettoyer}
        >
          <Text style={styles.buttonText}>
            Nettoyer l'historique
          </Text>
        </TouchableOpacity>
      </View>

      {decisions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Aucune validation enregistrée.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {decisions.map((item) => (
            <View key={item.id} style={styles.card}>
              <View
                style={[
                  styles.badge,
                  item.status === "approved" &&
                    styles.badgeApproved,
                  item.status === "rejected" &&
                    styles.badgeRejected,
                ]}
              >
                <Text style={styles.badgeText}>
                  {labelStatus(item.status)}
                </Text>
              </View>

              <Text style={styles.message}>
                {item.message}
              </Text>

              <Text style={styles.meta}>
                Intention : {item.intent}
              </Text>

              <Text style={styles.meta}>
                Agents :{" "}
                {item.agents.length > 0
                  ? item.agents.join(", ")
                  : "non précisés"}
              </Text>

              <Text style={styles.date}>
                Créée :{" "}
                {new Date(
                  item.createdAt
                ).toLocaleString()}
              </Text>

              {item.status === "pending" && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() =>
                      changerStatut(
                        item.id,
                        "approved"
                      )
                    }
                  >
                    <Text style={styles.buttonText}>
                      Approuver
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() =>
                      changerStatut(
                        item.id,
                        "rejected"
                      )
                    }
                  >
                    <Text style={styles.buttonText}>
                      Refuser
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status !== "pending" && (
                <Text style={styles.safeNotice}>
                  Décision auditée et routée
                  vers la file d'exécution
                  simulée. Aucune action externe
                  réelle n'a été exécutée.
                </Text>
              )}
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
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function labelStatus(
  status: StoredApprovalDecision["status"]
) {
  if (status === "approved")
    return "APPROUVÉE";

  if (status === "rejected")
    return "REFUSÉE";

  return "EN ATTENTE";
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 20 },
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
  executionCard: {
    backgroundColor: "#172554",
    borderColor: "#2563eb",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  executionTitle: {
    color: "#93c5fd",
    fontWeight: "900",
    marginBottom: 5,
  },
  executionText: {
    color: "#dbeafe",
    fontSize: 12,
    lineHeight: 18,
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
    textAlign: "center",
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cleanButton: {
    backgroundColor: "#475569",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  list: { paddingBottom: 50 },
  empty: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  emptyText: { color: "#94a3b8" },
  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#92400e",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  badgeApproved: {
    backgroundColor: "#166534",
  },
  badgeRejected: {
    backgroundColor: "#991b1b",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
  },
  message: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },
  meta: {
    color: "#cbd5e1",
    fontSize: 12,
    marginBottom: 4,
  },
  date: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#166534",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#991b1b",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
  },
  safeNotice: {
    color: "#fbbf24",
    fontSize: 11,
    marginTop: 10,
    lineHeight: 16,
  },
});
