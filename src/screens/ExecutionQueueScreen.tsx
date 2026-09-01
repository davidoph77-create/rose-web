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
  listExecutionQueue,
  updateExecutionQueueStatus,
} from "../core/v10/execution_queue/ExecutionQueueStore";
import {
  reviewDryRunItem,
} from "../core/v10/execution_queue/DryRunReviewEngine";
import type {
  ExecutionQueueItem,
} from "../core/v10/execution_queue/ExecutionQueueTypes";
import {
  prepareReleaseGate,
  updateReleaseGateStatus,
} from "../core/v10/release_gate";
import {
  invokeAndVerifyRelease,
} from "../core/v10/invocation_verification";

export default function ExecutionQueueScreen() {
  const [
    items,
    setItems,
  ] = useState<
    ExecutionQueueItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    reviewMessage,
    setReviewMessage,
  ] = useState("");

  const charger = useCallback(
    async () => {
      setLoading(true);

      try {
        const data =
          await listExecutionQueue();

        setItems(data);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    charger();
  }, [charger]);

  const revoir = async (
    item: ExecutionQueueItem
  ) => {
    const review =
      reviewDryRunItem(item);

    await updateExecutionQueueStatus(
      item.id,
      "reviewed"
    );

    const reviewedItem = {
      ...item,
      status:
        "reviewed" as const,
    };

    const release =
      await prepareReleaseGate(
        reviewedItem
      );

    setReviewMessage(
      `${review.summary} ${release.summary}`
    );

    await charger();
  };

  const confirmerRelease = (
    item: ExecutionQueueItem
  ) => {
    Alert.alert(
      "Seconde confirmation",
      "Confirmer cette action ? V10-026 lancera la Sandbox puis vérifiera automatiquement le résultat.",
      [
        {
          text: "Retour",
          style: "cancel",
        },
        {
          text: "Confirmer",
          onPress: async () => {
            const record =
              await updateReleaseGateStatus(
                item.id,
                "release_confirmed",
                "David"
              );

            if (!record) {
              setReviewMessage(
                "Release Gate introuvable. Revois d'abord le Dry Run."
              );
              return;
            }

            const result =
              await invokeAndVerifyRelease(
                record
              );

            setReviewMessage(
              `Release Gate : CONFIRMÉ. ${result.summary}`
            );
          },
        },
      ]
    );
  };

  const annuler = (
    item: ExecutionQueueItem
  ) => {
    Alert.alert(
      "Annuler cette action",
      "Cette action sera marquée comme annulée.",
      [
        {
          text: "Retour",
          style: "cancel",
        },
        {
          text: "Annuler l'action",
          style: "destructive",
          onPress: async () => {
            await updateExecutionQueueStatus(
              item.id,
              "cancelled"
            );

            await updateReleaseGateStatus(
              item.id,
              "release_cancelled",
              "David"
            );

            setReviewMessage(
              "Action annulée. Aucune invocation ni exécution externe."
            );

            await charger();
          },
        },
      ]
    );
  };

  const queued =
    items.filter(
      (item) =>
        item.status === "queued"
    ).length;

  const reviewed =
    items.filter(
      (item) =>
        item.status === "reviewed"
    ).length;

  const cancelled =
    items.filter(
      (item) =>
        item.status === "cancelled"
    ).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        File d'exécution V10
      </Text>

      <Text style={styles.subtitle}>
        V10-026 ajoute une vérification
        post-invocation. Après la Sandbox,
        Rose contrôle que la simulation est
        terminée et qu'aucune exécution
        externe n'a eu lieu.
      </Text>

      {reviewMessage ? (
        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>
            Post-Invocation Verification
          </Text>
          <Text style={styles.reviewText}>
            {reviewMessage}
          </Text>
        </View>
      ) : null}

      <View style={styles.stats}>
        <Stat label="À revoir" value={queued} />
        <Stat label="Revues" value={reviewed} />
        <Stat label="Annulées" value={cancelled} />
      </View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={charger}
      >
        <Text style={styles.buttonText}>
          {loading
            ? "Chargement..."
            : "Actualiser la file"}
        </Text>
      </TouchableOpacity>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Aucune action dans la file.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {items.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.topRow}>
                <View
                  style={[
                    styles.badge,
                    item.status === "reviewed" &&
                      styles.badgeReviewed,
                    item.status === "cancelled" &&
                      styles.badgeCancelled,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {statusLabel(item.status)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.riskBadge,
                    item.risk === "high" &&
                      styles.riskHigh,
                    item.risk === "medium" &&
                      styles.riskMedium,
                  ]}
                >
                  <Text style={styles.riskText}>
                    RISQUE {item.risk.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.kind}>
                {item.kind.toUpperCase()}
              </Text>

              <Text style={styles.message}>
                {item.message}
              </Text>

              <Text style={styles.meta}>
                Sandbox uniquement : OUI
              </Text>

              <Text style={styles.meta}>
                Vérification post-invocation : OUI
              </Text>

              <Text style={styles.date}>
                Mise en file :{" "}
                {new Date(
                  item.createdAt
                ).toLocaleString()}
              </Text>

              {item.status === "queued" && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => revoir(item)}
                  >
                    <Text style={styles.buttonText}>
                      Revoir le Dry Run
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => annuler(item)}
                  >
                    <Text style={styles.buttonText}>
                      Annuler
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === "reviewed" && (
                <>
                  <Text style={styles.safeNotice}>
                    Dry Run revu. La confirmation
                    lancera la Sandbox puis sa
                    vérification automatique.
                  </Text>

                  <TouchableOpacity
                    style={styles.releaseButton}
                    onPress={() =>
                      confirmerRelease(item)
                    }
                  >
                    <Text style={styles.buttonText}>
                      Confirmer + vérifier Sandbox
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {item.status === "cancelled" && (
                <Text style={styles.cancelNotice}>
                  Action annulée.
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

function statusLabel(
  status: ExecutionQueueItem["status"]
) {
  if (status === "reviewed")
    return "REVUE";

  if (status === "cancelled")
    return "ANNULÉE";

  return "À REVOIR";
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
  reviewCard: {
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  reviewTitle: {
    color: "#93c5fd",
    fontWeight: "900",
    marginBottom: 5,
  },
  reviewText: {
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
  },
  refreshButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  empty: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
  },
  emptyText: { color: "#94a3b8" },
  list: { paddingBottom: 60 },
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
    backgroundColor: "#92400e",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  badgeReviewed: { backgroundColor: "#166534" },
  badgeCancelled: { backgroundColor: "#991b1b" },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
  },
  riskBadge: {
    backgroundColor: "#166534",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  riskHigh: { backgroundColor: "#991b1b" },
  riskMedium: { backgroundColor: "#92400e" },
  riskText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
  },
  kind: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
  },
  message: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },
  meta: {
    color: "#cbd5e1",
    fontSize: 11,
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
  reviewButton: {
    flex: 1,
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#991b1b",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  releaseButton: {
    marginTop: 10,
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
  },
  safeNotice: {
    color: "#86efac",
    fontSize: 11,
    marginTop: 10,
  },
  cancelNotice: {
    color: "#fca5a5",
    fontSize: 11,
    marginTop: 10,
  },
});
