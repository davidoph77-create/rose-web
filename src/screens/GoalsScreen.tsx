import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type RoseGoal = {
  id: string;
  title: string;
  target: string;
  progress: number;
  status: string;
  subGoals: string[];
};

type GoalsScreenProps = {
  roseGoals: RoseGoal[];

  setRoseGoals: React.Dispatch<
    React.SetStateAction<RoseGoal[]>
  >;

  regenererObjectifsIA: () => void;
};

export default function GoalsScreen({
  roseGoals,
  setRoseGoals,
  regenererObjectifsIA,
}: GoalsScreenProps) {
  const modifierProgression = (
    id: string,
    nouvelleProgression: number
  ) => {
    setRoseGoals((objectifsActuels) =>
      objectifsActuels.map((goal) => {
        if (goal.id !== id) {
          return goal;
        }

        const progressionLimitee = Math.max(
          0,
          Math.min(100, nouvelleProgression)
        );

        return {
          ...goal,
          progress: progressionLimitee,
          status:
            progressionLimitee >= 100
              ? "done"
              : "active",       
       };
      })
    );
  };

  const augmenter = (
    id: string,
    progress: number
  ) => {
    modifierProgression(
      id,
      Math.min(100, progress + 10)
    );
  };

  const diminuer = (
    id: string,
    progress: number
  ) => {
    modifierProgression(
      id,
      Math.max(0, progress - 10)
    );
  };

  const supprimer = (id: string) => {
    setRoseGoals((objectifsActuels) =>
      objectifsActuels.filter(
        (goal) => goal.id !== id
      )
    );
  };
    return (
    <View>
      <Text style={styles.sectionTitle}>
        Objectifs IA
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Goal Engine V7
        </Text>

        <Text style={styles.text}>
          Rose crée automatiquement des objectifs à partir
          de sa mémoire.
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={regenererObjectifsIA}
        >
          <Text style={styles.mainButtonText}>
            Régénérer les objectifs IA
          </Text>
        </TouchableOpacity>
      </View>

      {roseGoals.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.text}>
            Aucun objectif IA disponible.
          </Text>
        </View>
      )}

      {roseGoals.map((goal) => (
        <View
          key={goal.id}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>
            {goal.title}
          </Text>

          <Text style={styles.text}>
            Cible : {goal.target}
          </Text>

          <Text style={styles.text}>
            Progression : {goal.progress} %
          </Text>

          <Text style={styles.text}>
            Statut : {goal.status}
          </Text>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${goal.progress}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.label}>
            Sous-objectifs
          </Text>

          {goal.subGoals.map(
            (subGoal: string, index: number) => (
              <Text
                key={`${goal.id}-${index}`}
                style={styles.text}
              >
                • {subGoal}
              </Text>
            )
          )}
                    <View style={styles.actions}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                augmenter(goal.id, goal.progress)
              }
            >
              <Text style={styles.smallButtonText}>
                +10 %
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                diminuer(goal.id, goal.progress)
              }
            >
              <Text style={styles.smallButtonText}>
                -10 %
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => supprimer(goal.id)}
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
    marginBottom: 14,
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },

  card: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  label: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },

  cardTitle: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },

  text: {
    marginBottom: 5,
    fontSize: 15,
    lineHeight: 22,
    color: "#e5e7eb",
  },

  mainButton: {
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#7c3aed",
  },

  mainButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  progressBar: {
    height: 10,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#22c55e",
  },

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },

  smallButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#7c3aed",
  },

  deleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#be123c",
  },

  smallButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});