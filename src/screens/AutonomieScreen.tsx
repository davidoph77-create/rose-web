import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AnalyseCore = {
  scoreAutonomie: number;
  decisionsProposees: number;
  webEnAttente: number;
  agendaEnAttente: number;
};

type AutonomieScreenProps = {
  analyseCore: AnalyseCore;
  autonomieRose: string[];
  agentWebRose: string[];
  agendaRose: string[];
  genererAutonomieRose: () => void;
  genererAgentWeb: () => void;
  genererAgendaRose: () => void;
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

function TextList({
  items,
  fallback,
}: {
  items: string[];
  fallback: string;
}) {
  if (!items || items.length === 0) {
    return <Text style={styles.text}>{fallback}</Text>;
  }

  return (
    <View>
      {items.map((item, index) => (
        <Text
          key={`${item}-${index}`}
          style={styles.text}
        >
          • {item}
        </Text>
      ))}
    </View>
  );
}

export default function AutonomieScreen({
  analyseCore,
  autonomieRose,
  agentWebRose,
  agendaRose,
  genererAutonomieRose,
  genererAgentWeb,
  genererAgendaRose,
}: AutonomieScreenProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        Autonomie de Rose
      </Text>

      <View style={styles.grid}>
        <Kpi
          label="Autonomie"
          value={`${analyseCore.scoreAutonomie}%`}
        />

        <Kpi
          label="Décisions"
          value={String(analyseCore.decisionsProposees)}
        />

        <Kpi
          label="Web en attente"
          value={String(analyseCore.webEnAttente)}
        />

        <Kpi
          label="Agenda"
          value={String(analyseCore.agendaEnAttente)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          État de l’autonomie
        </Text>

        <TextList
          items={autonomieRose}
          fallback="Rose n’a pas encore effectué son analyse d’autonomie."
        />

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererAutonomieRose}
        >
          <Text style={styles.mainButtonText}>
            Analyser l’autonomie
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Agent Web autonome
        </Text>

        <TextList
          items={agentWebRose}
          fallback="Aucune stratégie Web autonome n’a encore été générée."
        />

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererAgentWeb}
        >
          <Text style={styles.mainButtonText}>
            Générer la stratégie Web
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Organisation autonome
        </Text>

        <TextList
          items={agendaRose}
          fallback="Rose n’a pas encore analysé l’organisation de ton agenda."
        />

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererAgendaRose}
        >
          <Text style={styles.mainButtonText}>
            Générer l’organisation Agenda
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Règles de sécurité
        </Text>

        <Text style={styles.text}>
          • Rose prépare les actions avant de les exécuter.
        </Text>

        <Text style={styles.text}>
          • Les décisions importantes restent soumises à ta validation.
        </Text>

        <Text style={styles.text}>
          • Les recherches Web sont préparées avant toute action externe.
        </Text>

        <Text style={styles.text}>
          • Les événements Agenda restent locaux tant que Google Calendar
          n’est pas connecté.
        </Text>

        <Text style={styles.text}>
          • Rose utilise sa mémoire pour améliorer progressivement ses
          recommandations.
        </Text>
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
});