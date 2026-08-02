import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  RoseTask,
  deleteTask,
  updateTaskStatus,
} from "../agents/taskEngine";

type TaskScreenProps = {
  roseTasks: RoseTask[];
  setRoseTasks: React.Dispatch<
    React.SetStateAction<RoseTask[]>
  >;
  regenererTachesRose: () => void;
};

export default function TaskScreen({
  roseTasks,
  setRoseTasks,
  regenererTachesRose,
}: TaskScreenProps) {
  const demarrer = (id: string) => {
    setRoseTasks(
      updateTaskStatus(
        roseTasks,
        id,
        "in_progress"
      )
    );
  };

  const terminer = (id: string) => {
    setRoseTasks(
      updateTaskStatus(
        roseTasks,
        id,
        "done"
      )
    );
  };

  const mettreEnAttente = (id: string) => {
    setRoseTasks(
      updateTaskStatus(
        roseTasks,
        id,
        "pending"
      )
    );
  };

  const supprimer = (id: string) => {
    setRoseTasks(
      deleteTask(
        roseTasks,
        id
      )
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Tâches de Rose
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Task Engine V7
        </Text>

        <Text style={styles.text}>
          Rose transforme sa mémoire, ses objectifs et ses décisions
          en tâches concrètes et organisées.
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={regenererTachesRose}
        >
          <Text style={styles.mainButtonText}>
            Régénérer les tâches
          </Text>
        </TouchableOpacity>
      </View>

      {roseTasks.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.text}>
            Aucune tâche générée pour le moment.
          </Text>
        </View>
      )}

      {roseTasks.map((task) => (
        <View
          key={task.id}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>
            {task.title}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Priorité : {task.priority}
            </Text>
          </View>

          <Text style={styles.text}>
            Statut : {task.status}
          </Text>

          <Text style={styles.label}>
            Description
          </Text>

          <Text style={styles.text}>
            {task.description}
          </Text>

          {task.createdAt && (
            <Text style={styles.dateText}>
              Créée le{" "}
              {new Date(task.createdAt).toLocaleDateString()}
            </Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => demarrer(task.id)}
            >
              <Text style={styles.smallButtonText}>
                Démarrer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => terminer(task.id)}
            >
              <Text style={styles.smallButtonText}>
                Terminer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => mettreEnAttente(task.id)}
            >
              <Text style={styles.smallButtonText}>
                En attente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => supprimer(task.id)}
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

  dateText: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 8,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#312e81",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  badgeText: {
    color: "#c7d2fe",
    fontSize: 11,
    fontWeight: "800",
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