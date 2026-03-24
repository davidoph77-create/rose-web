import { normalizeText } from "./utils.ts";

export type CalendarCandidate = {
  title: string;
  notes: string;
  detected: boolean;
};

export function extractCalendarCandidate(message: string): CalendarCandidate | null {
  const text = normalizeText(message);

  if (!/agenda|calendrier|rdv|rendez vous|planning|evenement/.test(text)) {
    return null;
  }

  return {
    title: "Événement détecté",
    notes: message.trim(),
    detected: true,
  };
}