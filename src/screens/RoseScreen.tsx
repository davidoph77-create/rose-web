import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type RoseScreenProps = {
  message: string;
  setMessage: (value: string) => void;
  roseReponse: string;
  analyserMessage: () => void;
  parler: (texte: string) => void;
  analyseCore: any;
  resumeRose: string;
  prioritesRose: string[];
  conseilsRose: string[];
  objectifPrincipal: string;
  genererResumeRose: () => void;
  genererPrioritesRose: () => void;
  genererConseilsRose: () => void;
  definirObjectifPrincipal: () => void;
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

export default function RoseScreen({
  message,
  setMessage,
  roseReponse,
  analyserMessage,
  parler,
  analyseCore,
  resumeRose,
  prioritesRose,
  conseilsRose,
  objectifPrincipal,
  genererResumeRose,
  genererPrioritesRose,
  genererConseilsRose,
  definirObjectifPrincipal,
}: RoseScreenProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Rose</Text>

      <View style={styles.avatarCard}>
        <Text style={styles.avatar}>🌹</Text>

        <Text style={styles.roseName}>
          Rose IA
        </Text>

        <Text style={styles.text}>
          {roseReponse}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => parler(roseReponse)}
        >
          <Text style={styles.mainButtonText}>
            Parle-moi
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <Kpi
          label="Mémoire"
          value={`${analyseCore.scoreMemoire}%`}
        />

        <Kpi
          label="Autonomie"
          value={`${analyseCore.scoreAutonomie}%`}
        />

        <Kpi
          label="Agenda"
          value={String(analyseCore.agendaEnAttente)}
        />

        <Kpi
          label="Décisions"
          value={String(analyseCore.decisionsProposees)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Objectif principal
        </Text>

        <Text style={styles.text}>
          {objectifPrincipal}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={definirObjectifPrincipal}
        >
          <Text style={styles.mainButtonText}>
            Détecter objectif principal
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Parle à Rose
        </Text>

        <TextInput
          style={styles.inputLarge}
          placeholder="Écris une information, un objectif, un rappel..."
          placeholderTextColor="#777"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity
          style={styles.mainButton}
          onPress={analyserMessage}
        >
          <Text style={styles.mainButtonText}>
            Envoyer à Rose
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Résumé
        </Text>

        <Text style={styles.text}>
          {resumeRose}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererResumeRose}
        >
          <Text style={styles.mainButtonText}>
            Générer résumé vocal
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Priorités
        </Text>

        {prioritesRose.map(
          (priorite, index) => (
            <Text
              key={`${priorite}-${index}`}
              style={styles.text}
            >
              • {priorite}
            </Text>
          )
        )}

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererPrioritesRose}
        >
          <Text style={styles.mainButtonText}>
            Mettre à jour priorités
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Conseils
        </Text>

        {conseilsRose.map(
          (conseil, index) => (
            <Text
              key={`${conseil}-${index}`}
              style={styles.text}
            >
              • {conseil}
            </Text>
          )
        )}

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererConseilsRose}
        >
          <Text style={styles.mainButtonText}>
            Générer conseils
          </Text>
        </TouchableOpacity>
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

  avatarCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    marginBottom: 12,
  },

  avatar: {
    fontSize: 66,
    marginBottom: 4,
  },

  roseName: {
    color: "#f9a8d4",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
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

  inputLarge: {
    minHeight: 110,
    backgroundColor: "#070b16",
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 14,
    textAlignVertical: "top",
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  kpi: {
    width: "48%",
    minHeight: 88,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  kpiValue: {
    color: "#f9a8d4",
    fontSize: 23,
    fontWeight: "900",
  },

  kpiLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
});