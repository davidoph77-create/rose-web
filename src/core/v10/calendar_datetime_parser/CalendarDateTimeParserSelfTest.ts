import { parseCalendarDateTime } from "./CalendarDateTimeParser";

export function runCalendarDateTimeParserSelfTest() {
  const fixedNow = new Date("2026-09-05T12:00:00+02:00");

  const samples = [
    "Ajoute un rendez-vous chez le notaire mardi à 14 h",
    "Ajoute un rendez-vous demain à 09:30",
    "Planifie un appel vendredi prochain à 16h30",
    "Programme une visite demain matin",
  ];

  return {
    module: "V10-042B",
    parserReady: true,
    writeEnabled: false,
    results: samples.map((sample) =>
      parseCalendarDateTime(sample, { now: fixedNow })
    ),
  };
}
