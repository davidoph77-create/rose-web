import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { readUpcomingGoogleCalendarEvents } from "./GoogleCalendarRealRead";
import type { RoseCalendarEvent } from "./CalendarRealReadTypes";

function formatDate(value: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function GoogleCalendarRealReadCard() {
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState<RoseCalendarEvent[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [tested, setTested] = useState(false);

  async function refresh() {
    setBusy(true);
    setError(undefined);
    try {
      const result = await readUpcomingGoogleCalendarEvents(10);
      setTested(true);
      if (!result.ok) {
        setEvents([]);
        setError(result.error || "Lecture Google Calendar impossible.");
        return;
      }
      setEvents(result.events);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Google Calendar - lecture reelle</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Mode</Text>
        <Text style={styles.ok}>READ ONLY</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Ecriture Calendar</Text>
        <Text style={styles.warn}>DESACTIVEE</Text>
      </View>

      <Pressable
        onPress={refresh}
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
          <Text style={styles.buttonText}>Lire les prochains rendez-vous</Text>
        )}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {tested && !error && events.length === 0 ? (
        <Text style={styles.note}>Aucun evenement a venir trouve.</Text>
      ) : null}

      {events.map((event) => (
        <View key={event.id || `${event.summary}-${event.start}`} style={styles.event}>
          <Text style={styles.eventTitle}>{event.summary}</Text>
          <Text style={styles.eventDate}>{formatDate(event.start)}</Text>
          {event.location ? (
            <Text style={styles.eventMeta}>{event.location}</Text>
          ) : null}
        </View>
      ))}

      <Text style={styles.note}>
        Lecture seule. Aucune creation, modification ou suppression d'evenement.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0d1526",
    borderWidth: 1,
    borderColor: "#22c55e",
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
  label: { color: "#cbd5e1", flex: 1 },
  ok: { color: "#6ee7b7", fontWeight: "900" },
  warn: { color: "#fbbf24", fontWeight: "900" },
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
  error: {
    color: "#fca5a5",
    marginTop: 10,
    lineHeight: 18,
  },
  note: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },
  event: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#334155",
  },
  eventTitle: { color: "#f8fafc", fontWeight: "800" },
  eventDate: { color: "#93c5fd", marginTop: 3 },
  eventMeta: { color: "#cbd5e1", marginTop: 3, fontSize: 12 },
});
