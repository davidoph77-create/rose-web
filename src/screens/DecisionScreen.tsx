import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  RoseDecision,
  deleteDecision,
  updateDecisionStatus,
} from "../agents/decisionEngine";

type DecisionScreenProps = {
  roseDecisions: RoseDecision[];
  setRoseDecisions: React.Dispatch<
    React.SetStateAction<RoseDecision[]>
  >;
  regenererDecisionsRose: () => void;
};

export default function DecisionScreen({
  roseDecisions,
  setRoseDecisions,
  regenererDecisionsRose,
}: DecisionScreenProps) {
  const accepter = (id: string) => {
    setRoseDecisions(
      updateDecisionStatus(
        roseDecisions,
        id,
        "accepted"
      )
    );
  };

  const refuser = (id: string) => {
    setRoseDecisions(
      updateDecisionStatus(
        roseDecisions,
        id,
        "rejected"
      )
    );
  };

  const supprimer = (id: string) => {
    setRoseDecisions(
      deleteDecision(
        roseDecisions,
        id
      )
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Décisions de Rose
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Decision Engine V7
        </Text>

        <Text style={styles.text}>
          Rose explique pourquoi elle recommande une action.
          Tu peux ensuite accepter ou refuser sa proposition.
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={regenererDecisionsRose}
        >
          <Text style={styles.mainButtonText}>
            Régénérer les décisions
          </Text>
        </TouchableOpacity>
      </View>

      {roseDecisions.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.text}>
            Aucune décision proposée.
          </Text>
        </View>
      )}

      {roseDecisions.map((decision) => (
        <View key={decision.id} style={styles.card}>
          <Text style={styles.cardTitle}>
            {decision.title}
          </Text>

          <Text style={styles.text}>
            Type : {decision.type}
          </Text>

          <Text style={styles.text}>
            Priorité : {decision.priority}
          </Text>

          <Text style={styles.text}>
            Statut : {decision.status}
          </Text>

          <Text style={styles.label}>
            Explication
          </Text>

          <Text style={styles.text}>
            {decision.explanation}
          </Text>

          <Text style={styles.label}>
            Recommandation
          </Text>

          <Text style={styles.text}>
            {decision.recommendation}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => accepter(decision.id)}
            >
              <Text style={styles.smallButtonText}>
                Accepter
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => refuser(decision.id)}
            >
              <Text style={styles.smallButtonText}>
                Refuser
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => supprimer(decision.id)}
            >
              <Text style={styles.smallButtonText}>
                Supprimer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  cardTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },

  label: {
    color: "#f9a8d4",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 4,
  },

  text: {
    color: "#dbeafe",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 5,
  },

  mainButton: {
    backgroundColor: "#be185d",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  mainButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },

  smallButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 11,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginRight: 6,
    marginTop: 6,
  },

  deleteButton: {
    backgroundColor: "#991b1b",
    borderRadius: 11,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginRight: 6,
    marginTop: 6,
  },

  smallButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
});

