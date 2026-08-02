import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

type Memoire = {
  id: number;
  texte: string;
  categorie: string;
  importance: "Normale" | "Importante" | "Longue durée";
  date: string;
};

type Objectif = {
  id: number;
  titre: string;
  cible: string;
  progression: number;
  statut: string;
};

type EntrepriseScreenProps = {
  memoires: Memoire[];
  objectifs: Objectif[];
};

function Kpi({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

export default function EntrepriseScreen({
  memoires,
  objectifs,
}: EntrepriseScreenProps) {
  const memoiresEntreprise = memoires.filter(
    (memoire) => memoire.categorie === "Entreprise"
  );

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Rose Entreprise
      </Text>

      <View style={styles.grid}>
        <Kpi
          label="Infos entreprise"
          value={String(memoiresEntreprise.length)}
        />

        <Kpi
          label="Objectifs"
          value={String(objectifs.length)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Tableau de bord
        </Text>

        <Text style={styles.text}>
          Rose peut suivre :
        </Text>

        <Text style={styles.text}>
          • Les chantiers
        </Text>

        <Text style={styles.text}>
          • Les clients
        </Text>

        <Text style={styles.text}>
          • Les objectifs financiers
        </Text>

        <Text style={styles.text}>
          • Les rendez-vous
        </Text>

        <Text style={styles.text}>
          • Les priorités quotidiennes
        </Text>
      </View>

      {memoiresEntreprise.map((memoire) => (
        <View
          key={memoire.id}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>
            {memoire.categorie}
          </Text>

          <Text style={styles.text}>
            {memoire.texte}
          </Text>

          <Text style={styles.dateText}>
            {memoire.date}
          </Text>
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  kpi: {
    width: "48%",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  kpiValue: {
    color: "#f9a8d4",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },

  kpiLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
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
});