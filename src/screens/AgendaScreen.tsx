import React from "react";
import {
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