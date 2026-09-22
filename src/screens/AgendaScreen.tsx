import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  RoseCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEventStatus,
} from "../agents/calendarEngine";

import {
  AgendaCalendarItem,
  refreshAgendaCalendarBridge,
} from "../core/v10/calendar_agenda_bridge";

import { connectGoogleCalendarFromApp } from "../core/v10/calendar_oauth_app/GoogleCalendarOAuthController";

import {
  getTodayCalendarIntelligence,
  getTomorrowCalendarIntelligence,
  getThisWeekCalendarIntelligence,
  getNextCalendarEventIntelligence,
} from "../core/v10/calendar_intelligence/CalendarIntelligence";

type AgendaScreenProps = {
  calendarEvents: RoseCalendarEvent[];
  setCalendarEvents: React.Dispatch<
    React.SetStateAction<RoseCalendarEvent[]>
  >;
  regenererAgendaRose: () => void;
};

export default function AgendaScreen({
  calendarEvents,
  setCalendarEvents,
  regenererAgendaRose,
}: AgendaScreenProps) {
  const [googleEvents, setGoogleEvents] = useState<AgendaCalendarItem[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | undefined>();
  const [calendarIntelligence, setCalendarIntelligence] = useState({
    today: "",
    tomorrow: "",
    thisWeek: "",
    nextEvent: "",
  });

  const refreshCalendarIntelligence = useCallback(() => {
    const next = {
      today: getTodayCalendarIntelligence().summary,
      tomorrow: getTomorrowCalendarIntelligence().summary,
      thisWeek: getThisWeekCalendarIntelligence().summary,
      nextEvent: getNextCalendarEventIntelligence().summary,
    };
    setCalendarIntelligence(next);
    console.log("[ROSE V10-044D4 CALENDAR INTELLIGENCE]", next);
  }, []);

  const connectGoogleAgenda = useCallback(async () => {
    try {
      setGoogleLoading(true);
      setGoogleError(undefined);
      const connection = await connectGoogleCalendarFromApp();
      if (!connection.ok) {
        setGoogleError(connection.error || "Impossible de connecter Google Calendar.");
        return;
      }
      const snapshot = await refreshAgendaCalendarBridge(20);
      setGoogleEvents(snapshot.items);
      setGoogleError(snapshot.error);
      refreshCalendarIntelligence();
    } catch (error: any) {
      setGoogleError(error?.message || "Impossible de connecter Google Calendar.");
    } finally {
      setGoogleLoading(false);
    }
  }, [refreshCalendarIntelligence]);

  const refreshGoogleAgenda = useCallback(async () => {
    try {
      setGoogleLoading(true);
      setGoogleError(undefined);
      const snapshot = await refreshAgendaCalendarBridge(20);
      setGoogleEvents(snapshot.items);
      setGoogleError(snapshot.error);
      refreshCalendarIntelligence();
    } catch (error: any) {
      setGoogleError(error?.message || "Impossible de lire Google Calendar.");
    } finally {
      setGoogleLoading(false);
    }
  }, [refreshCalendarIntelligence]);

  useEffect(() => {
    refreshGoogleAgenda();
  }, [refreshGoogleAgenda]);

  const formatGoogleDate = (value?: string) => {
    if (!value) return "Date non précisée";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const planifier = (id: string) => {
    setCalendarEvents(
      updateCalendarEventStatus(
        calendarEvents,
        id,
        "scheduled"
      )
    );
  };

  const terminer = (id: string) => {
    setCalendarEvents(
      updateCalendarEventStatus(
        calendarEvents,
        id,
        "done"
      )
    );
  };

  const annuler = (id: string) => {
    setCalendarEvents(
      updateCalendarEventStatus(
        calendarEvents,
        id,
        "cancelled"
      )
    );
  };

  const supprimer = (id: string) => {
    setCalendarEvents(
      deleteCalendarEvent(
        calendarEvents,
        id
      )
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Agenda de Rose
      </Text>

      <View style={styles.googleCard}>
        <Text style={styles.cardTitle}>
          Google Calendar — rendez-vous réels
        </Text>
        <Text style={styles.googleReadOnly}>LECTURE SEULE</Text>
        <Text style={styles.text}>
          Rose peut consulter ces rendez-vous Google, sans création,
          modification ni suppression.
        </Text>

        <TouchableOpacity
          style={styles.googleConnectButton}
          onPress={connectGoogleAgenda}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.mainButtonText}>Connecter Google Calendar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={refreshGoogleAgenda}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.mainButtonText}>Actualiser Google Calendar</Text>
          )}
        </TouchableOpacity>

        {googleError ? (
          <Text style={styles.errorText}>{googleError}</Text>
        ) : null}

        {!googleLoading && !googleError && googleEvents.length === 0 ? (
          <Text style={styles.googleEmpty}>Aucun rendez-vous Google à venir.</Text>
        ) : null}
      </View>

      <View style={styles.intelligenceCard}>
        <Text style={styles.cardTitle}>Rose — Intelligence calendrier D4</Text>
        <Text style={styles.googleReadOnly}>LECTURE SEULE</Text>
        <Text style={styles.intelligenceLabel}>Aujourd’hui</Text>
        <Text style={styles.text}>{calendarIntelligence.today || "Analyse en attente."}</Text>
        <Text style={styles.intelligenceLabel}>Demain</Text>
        <Text style={styles.text}>{calendarIntelligence.tomorrow || "Analyse en attente."}</Text>
        <Text style={styles.intelligenceLabel}>Cette semaine</Text>
        <Text style={styles.text}>{calendarIntelligence.thisWeek || "Analyse en attente."}</Text>
        <Text style={styles.intelligenceLabel}>Prochain événement</Text>
        <Text style={styles.text}>{calendarIntelligence.nextEvent || "Analyse en attente."}</Text>
      </View>

      {googleEvents.map((event) => (
        <View key={`google-${event.id}`} style={styles.googleEventCard}>
          <Text style={styles.cardTitle}>
            {event.title || "Rendez-vous Google Calendar"}
          </Text>
          <Text style={styles.text}>Début : {formatGoogleDate(event.start)}</Text>
          {event.end ? (
            <Text style={styles.text}>Fin : {formatGoogleDate(event.end)}</Text>
          ) : null}
          {event.location ? (
            <Text style={styles.text}>Lieu : {event.location}</Text>
          ) : null}
          <Text style={styles.googleSource}>
            Source : Google Calendar • lecture seule
          </Text>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.label}>
          Calendar Engine V7
        </Text>

        <Text style={styles.text}>
          Rose prépare des événements à partir de sa mémoire.
          Ces événements restent dans l’application tant qu’ils ne sont
          pas connectés à Google Calendar.
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={regenererAgendaRose}
        >
          <Text style={styles.mainButtonText}>
            Régénérer les événements
          </Text>
        </TouchableOpacity>
      </View>

      {calendarEvents.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.text}>
            Aucun événement Agenda préparé.
          </Text>
        </View>
      )}

      {calendarEvents.map((event) => (
        <View key={event.id} style={styles.card}>
          <Text style={styles.cardTitle}>
            {event.title}
          </Text>

          <Text style={styles.text}>
            Catégorie : {event.category}
          </Text>

          <Text style={styles.text}>
            Date suggérée : {event.suggestedDate}
          </Text>

          <Text style={styles.text}>
            Statut : {event.status}
          </Text>

          <Text style={styles.label}>
            Description
          </Text>

          <Text style={styles.text}>
            {event.description}
          </Text>

          <Text style={styles.dateText}>
            Créé le{" "}
            {new Date(event.createdAt).toLocaleDateString()}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => planifier(event.id)}
            >
              <Text style={styles.smallButtonText}>
                Planifier
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => terminer(event.id)}
            >
              <Text style={styles.smallButtonText}>
                Terminé
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => annuler(event.id)}
            >
              <Text style={styles.smallButtonText}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => supprimer(event.id)}
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

  googleCard: {
    backgroundColor: "#0d1526",
    borderWidth: 1,
    borderColor: "#34d399",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  intelligenceCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#a855f7",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  intelligenceLabel: {
    color: "#f9a8d4",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 4,
  },

  googleEventCard: {
    backgroundColor: "#0d1526",
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  googleReadOnly: {
    color: "#6ee7b7",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
  },

  googleConnectButton: {
    backgroundColor: "#059669",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  googleButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  googleEmpty: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 10,
  },

  googleSource: {
    color: "#6ee7b7",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
  },

  errorText: {
    color: "#fbbf24",
    fontSize: 12,
    marginTop: 10,
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