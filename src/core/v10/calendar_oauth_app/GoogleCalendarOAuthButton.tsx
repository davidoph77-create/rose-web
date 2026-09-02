import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  connectGoogleCalendarFromApp,
  getGoogleCalendarConnectionStatus,
} from "./GoogleCalendarOAuthController";

export default function GoogleCalendarOAuthButton() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(getGoogleCalendarConnectionStatus());

  async function onConnect() {
    if (!status.clientIdConfigured) {
      Alert.alert(
        "Google Calendar",
        "Le Client ID Android Google n'est pas encore configuré dans EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID."
      );
      return;
    }

    try {
      setBusy(true);
      const result = await connectGoogleCalendarFromApp();
      setStatus(getGoogleCalendarConnectionStatus());

      if (result.ok) {
        Alert.alert(
          "Google Calendar connecté",
          "Connexion réussie en lecture seule. Rose peut lire le calendrier mais ne peut rien créer, modifier ou supprimer."
        );
      } else {
        Alert.alert(
          "Connexion Google Calendar",
          result.error || "Connexion non terminée."
        );
      }
    } catch (e: any) {
      Alert.alert(
        "Erreur Google Calendar",
        e?.message || "Erreur inconnue pendant la connexion."
      );
    } finally {
      setBusy(false);
      setStatus(getGoogleCalendarConnectionStatus());
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Google Calendar — connexion réelle</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Client ID Android</Text>
        <Text style={status.clientIdConfigured ? styles.ok : styles.warn}>
          {status.clientIdConfigured ? "CONFIGURÉ" : "À CONFIGURER"}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Mode</Text>
        <Text style={styles.ok}>READ ONLY</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Écriture Calendar</Text>
        <Text style={styles.warn}>DÉSACTIVÉE</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Statut session</Text>
        <Text style={status.status === "connected" ? styles.ok : styles.info}>
          {String(status.status || "idle").toUpperCase()}
        </Text>
      </View>

      <Pressable
        onPress={onConnect}
        disabled={busy}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          busy && styles.buttonDisabled,
        ]}
      >
        {busy ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>Connecter Google Calendar</Text>
        )}
      </Pressable>

      <Text style={styles.note}>
        Autorisation demandée : lecture seule du calendrier.
        Aucune création, modification ou suppression d'événement.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0d1526",
    borderWidth: 1,
    borderColor: "#60a5fa",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  title: {
    color: "#f8fafc",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 7,
  },
  label: {
    color: "#cbd5e1",
    flex: 1,
  },
  ok: { color: "#6ee7b7", fontWeight: "900" },
  warn: { color: "#fbbf24", fontWeight: "900" },
  info: { color: "#93c5fd", fontWeight: "900" },
  button: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontWeight: "900" },
  note: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },
});
