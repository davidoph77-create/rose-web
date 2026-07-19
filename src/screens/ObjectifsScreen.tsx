import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
export type Objectif = {
  id: number;
  titre: string;
  cible: string;
  progression: number;
  statut: string;
};

type ObjectifsScreenProps = {
  objectifs: Objectif[];
  setObjectifs: React.Dispatch<
    React.SetStateAction<Objectif[]>
  >;
};

export default function ObjectifsScreen({
  objectifs,
  setObjectifs,
}: ObjectifsScreenProps) {
  const [titre, setTitre] = useState("");
  const [cible, setCible] = useState("");

  const ajouterObjectif = () => {
    if (!titre.trim()) {
      return;
    }

    const nouvelObjectif: Objectif = {
      id: Date.now(),
      titre: titre.trim(),
      cible: cible.trim(),
      progression: 0,
      statut: "En cours",
    };

    setObjectifs((actuels) => [
      nouvelObjectif,
      ...actuels,
    ]);

    setTitre("");
    setCible("");
  };
   const modifierProgression = (
    id: number,
    variation: number
  ) => {
    setObjectifs((actuels) =>
      actuels.map((objectif) => {
        if (objectif.id !== id) {
          return objectif;
        }

        const nouvelleProgression = Math.max(
          0,
          Math.min(
            100,
            objectif.progression + variation
          )
        );

        return {
          ...objectif,
          progression: nouvelleProgression,
          statut:
            nouvelleProgression >= 100
              ? "Terminé"
              : "En cours",
        };
      })
    );
  };

  const supprimerObjectif = (id: number) => {
    setObjectifs((actuels) =>
      actuels.filter(
        (objectif) => objectif.id !== id
      )
    );
  };
    return (
    <View>
      <Text style={styles.sectionTitle}>
        Objectifs personnels
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Ajouter un objectif
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Titre de l’objectif"
          placeholderTextColor="#64748b"
          value={titre}
          onChangeText={setTitre}
        />

        <TextInput
          style={styles.input}
          placeholder="Cible ou résultat attendu"
          placeholderTextColor="#64748b"
          value={cible}
          onChangeText={setCible}
        />

        <TouchableOpacity
          style={styles.mainButton}
          onPress={ajouterObjectif}
        >
          <Text style={styles.mainButtonText}>
            Ajouter l’objectif
          </Text>
        </TouchableOpacity>
      </View>

      {objectifs.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.text}>
            Aucun objectif enregistré.
          </Text>
        </View>
      )}

      {objectifs.map((objectif) => (
        <View
          key={objectif.id}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>
            {objectif.titre}
          </Text>

          <Text style={styles.text}>
            Cible : {objectif.cible || "Non définie"}
          </Text>

          <Text style={styles.text}>
            Progression : {objectif.progression} %
          </Text>

          <Text style={styles.text}>
            Statut : {objectif.statut}
          </Text>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${objectif.progression}%`,
                },
              ]}
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                modifierProgression(objectif.id, 10)
              }
            >
              <Text style={styles.smallButtonText}>
                +10 %
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                modifierProgression(objectif.id, -10)
              }
            >
              <Text style={styles.smallButtonText}>
                -10 %
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                supprimerObjectif(objectif.id)
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

  cardTitle: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },

  text: {
    marginBottom: 5,
    fontSize: 15,
    lineHeight: 21,
    color: "#e5e7eb",
  },

  input: {
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    fontSize: 15,
    color: "#ffffff",
  },

  mainButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#7c3aed",
  },

  mainButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },

  progressBar: {
    height: 10,
    marginTop: 12,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#ec4899",
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
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});