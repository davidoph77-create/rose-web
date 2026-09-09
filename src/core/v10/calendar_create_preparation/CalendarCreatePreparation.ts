import { parseCalendarDateTime } from "../calendar_datetime_parser";
import type {
  CalendarCreatePreparationResult,
  GoogleCalendarCreatePayload,
} from "./CalendarCreatePreparationTypes";

function cleanTitle(value: unknown) {
  const title = typeof value === "string" ? value.trim() : "";
  return title || "Rendez-vous";
}

function cleanLocation(value: unknown) {
  const location = typeof value === "string" ? value.trim() : "";
  return location || undefined;
}

export function prepareGoogleCalendarCreatePayload(
  approvedDraft: any
): CalendarCreatePreparationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!approvedDraft) {
    return {
      ok: false,
      errors: ["Aucun brouillon approuvé disponible."],
      warnings,
      executionEnabled: false,
      requiresExplicitApproval: true,
    };
  }

  const sourceMessage =
    typeof approvedDraft.originalMessage === "string"
      ? approvedDraft.originalMessage
      : "";

  const parsed = parseCalendarDateTime(sourceMessage);

  if (!parsed.ok || !parsed.start || !parsed.end) {
    if (parsed.missing.includes("date")) {
      errors.push("Date introuvable ou ambiguë.");
    }
    if (parsed.missing.includes("time")) {
      errors.push("Heure introuvable ou ambiguë.");
    }
  }

  const title = cleanTitle(approvedDraft.title);

  if (title.length < 2) {
    errors.push("Titre d'événement invalide.");
  }

  const location = cleanLocation(approvedDraft.location);

  if (!location) {
    warnings.push("Aucun lieu structuré : le champ location sera omis.");
  }

  if (errors.length > 0 || !parsed.start || !parsed.end) {
    return {
      ok: false,
      errors,
      warnings,
      executionEnabled: false,
      requiresExplicitApproval: true,
    };
  }

  const payload: GoogleCalendarCreatePayload = {
    summary: title,
    start: {
      dateTime: parsed.start,
      timeZone: "Europe/Paris",
    },
    end: {
      dateTime: parsed.end,
      timeZone: "Europe/Paris",
    },
    ...(location ? { location } : {}),
  };

  return {
    ok: true,
    payload,
    errors,
    warnings,
    executionEnabled: false,
    requiresExplicitApproval: true,
  };
}

export function formatPreparedGoogleCalendarPayload(
  result: CalendarCreatePreparationResult
) {
  if (!result.ok || !result.payload) {
    const details = result.errors.join(" ");
    return (
      "Le brouillon est approuvé, mais le payload Google Calendar n'est pas encore valide. " +
      (details || "Des informations obligatoires sont manquantes.") +
      " Aucune écriture Google Calendar n'a été effectuée."
    );
  }

  const payload = result.payload;

  return (
    `Payload Google Calendar prêt : « ${payload.summary} ». ` +
    `Début : ${payload.start.dateTime}. Fin : ${payload.end.dateTime}. ` +
    `Fuseau : ${payload.start.timeZone}. ` +
    `${payload.location ? `Lieu : ${payload.location}. ` : ""}` +
    "Création réelle toujours désactivée."
  );
}
