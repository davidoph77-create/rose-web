import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
export type MemoireImportance =
  | "Normale"
  | "Importante"
  | "Longue durée";

export type Memoire = {
  id: number;
  texte: string;
  categorie: string;
  importance: MemoireImportance;
  date: string;
};

type MemoireScreenProps = {
  memoires: Memoire[];
  setMemoires: React.Dispatch<
    React.SetStateAction<Memoire[]>
  >;
  memoireLongueDuree: string[];
};

export default function MemoireScreen({
  memoires,
  setMemoires,
  memoireLongueDuree,
}: MemoireScreenProps) {
  const supprimerMemoire = (id: number) => {
    setMemoires((memoiresActuelles) =>
      memoiresActuelles.filter(
        (memoire) => memoire.id !== id
      )
    );
  };

  const basculerImportance = (id: number) => {
    setMemoires((memoiresActuelles) =>
      memoiresActuelles.map((memoire) => {
        if (memoire.id !== id) {
          return memoire;
        }

        const prochaineImportance: MemoireImportance =
          memoire.importance === "Normale"
            ? "Importante"
            : memoire.importance === "Importante"
              ? "Longue durée"
              : "Normale";

        return {
          ...memoire,
          importance: prochaineImportance,
        };
      })
    );
  };

  const effacerToutesLesMemoires = () => {
    setMemoires([]);
  };
   return (
    <View>
      <Text style={styles.sectionTitle}>
        Mémoire de Rose
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Mémoire active
        </Text>

        <Text style={styles.text}>
          Rose conserve les informations que tu lui donnes et peut
          les classer comme normales, importantes ou longue durée.
        </Text>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={effacerToutesLesMemoires}
        >
          <Text style={styles.smallButtonText}>
            Effacer toute la mémoire
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Mémoire longue durée
        </Text>

        {memoireLongueDuree.length === 0 && (
          <Text style={styles.text}>
            Aucune mémoire longue durée enregistrée.
          </Text>
        )}

        {memoireLongueDuree.map(
          (memoire, index) => (
            <Text
              key={`${memoire}-${index}`}
              style={styles.text}
            >
              • {memoire}
            </Text>
          )
        )}
      </View>

      {memoires.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.text}>
            Aucune mémoire enregistrée pour le moment.
          </Text>
        </View>
      )}

      {memoires.map((memoire) => (
        <View
          key={String(memoire.id)}
          style={styles.card}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {memoire.categorie} • {memoire.importance}
            </Text>
          </View>

          <Text style={styles.text}>
            {memoire.texte}
          </Text>

          <Text style={styles.dateText}>
            Enregistrée le {memoire.date}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                basculerImportance(memoire.id)
              }
            >
              <Text style={styles.smallButtonText}>
                Changer importance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                supprimerMemoire(memoire.id)
              }
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
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },

  label: {
    marginBottom: 8,
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },

  text: {
    fontSize: 15,
    lineHeight: 21,
    color: "#e5e7eb",
  },

  dateText: {
    marginTop: 10,
    fontSize: 12,
    color: "#9ca3af",
  },

  badge: {
    alignSelf: "flex-start",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(236, 72, 153, 0.18)",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f9a8d4",
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
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#be123c",
  },

  smallButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});