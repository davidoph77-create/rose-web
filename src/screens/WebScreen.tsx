import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  WebSearchRequest,
  deleteWebRequest,
  updateWebRequestStatus,
} from "../agents/webEngine";

type WebScreenProps = {
  webRequests: WebSearchRequest[];
  setWebRequests: React.Dispatch<
    React.SetStateAction<WebSearchRequest[]>
  >;
  regenererRecherchesWeb: () => void;
};

export default function WebScreen({
  webRequests,
  setWebRequests,
  regenererRecherchesWeb,
}: WebScreenProps) {
  const valider = (id: string) => {
    setWebRequests(
      updateWebRequestStatus(webRequests, id, "done")
    );
  };

  const annuler = (id: string) => {
    setWebRequests(
      updateWebRequestStatus(webRequests, id, "cancelled")
    );
  };

  const supprimer = (id: string) => {
    setWebRequests(deleteWebRequest(webRequests, id));
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Web Engine</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Recherches préparées</Text>

        <Text style={styles.text}>
          Rose prépare des recherches à partir de sa mémoire.
          Elle attend toujours ta validation avant toute action externe.
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={regenererRecherchesWeb}
        >
          <Text style={styles.mainButtonText}>
            Régénérer les recherches Web
          </Text>
        </TouchableOpacity>
      </View>

      {webRequests.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.text}>
            Aucune recherche Web préparée.
          </Text>
        </View>
      )}

      {webRequests.map((request) => (
        <View key={request.id} style={styles.card}>
          <Text style={styles.cardTitle}>{request.query}</Text>

          <Text style={styles.text}>
            Catégorie : {request.category}
          </Text>

          <Text style={styles.text}>
            Statut : {request.status}
          </Text>

          <Text style={styles.label}>Raison</Text>

          <Text style={styles.text}>{request.reason}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => valider(request.id)}
            >
              <Text style={styles.smallButtonText}>Valider</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => annuler(request.id)}
            >
              <Text style={styles.smallButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => supprimer(request.id)}
            >
              <Text style={styles.smallButtonText}>Supprimer</Text>
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
