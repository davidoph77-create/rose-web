import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

type AnalyseCore = {
  scoreMemoire: number;
  scoreCerveau: number;
  scoreAutonomie: number;
  agendaEnAttente: number;
};

type Memoire = {
  id: number;
  texte: string;
  categorie: string;
  importance: "Normale" | "Importante" | "Longue durée";
  date: string;
};

type ApprentissageScreenProps = {
  analyseCore: AnalyseCore;
  memoires: Memoire[];
  resumeRose: string;
  prioritesRose: string[];
  conseilsRose: string[];
  objectifPrincipal: string;
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

export default function ApprentissageScreen({
  analyseCore,
  resumeRose,
  prioritesRose,
  conseilsRose,
}: ApprentissageScreenProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        Apprentissage
      </Text>

      <View style={styles.grid}>
        <Kpi
          label="Mémoire"
          value={`${analyseCore.scoreMemoire}%`}
        />

        <Kpi
          label="Cerveau"
          value={`${analyseCore.scoreCerveau}%`}
        />

        <Kpi
          label="Autonomie"
          value={`${analyseCore.scoreAutonomie}%`}
        />

        <Kpi
          label="Agenda"
          value={String(analyseCore.agendaEnAttente)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Résumé
        </Text>

        <Text style={styles.text}>
          {resumeRose}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Priorités
        </Text>

        {prioritesRose.map((priorite, index) => (
          <Text
            key={`${priorite}-${index}`}
            style={styles.text}
          >
            • {priorite}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Conseils
        </Text>

        {conseilsRose.map((conseil, index) => (
          <Text
            key={`${conseil}-${index}`}
            style={styles.text}
          >
            • {conseil}
          </Text>
        ))}
      </View>
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
});