import { prepareCalendarWriteDraft } from "../calendar_write_foundation";
import { parseCalendarDateTime } from "../calendar_datetime_parser";

export type IntegratedCalendarWriteDraft = {
  handled: boolean;
  readyForApproval: boolean;
  writeEnabled: false;
  text: string;
  draft?: {
    id: string;
    action: "create_event";
    title: string;
    start?: string;
    end?: string;
    dateLabel?: string;
    timeLabel?: string;
    durationMinutes?: number;
    sourceMessage: string;
    requiresApproval: true;
    writeEnabled: false;
    status: "draft";
    missing: Array<"date" | "time">;
    confidence: number;
  };
};

export function prepareIntegratedCalendarWriteDraft(
  message: string
): IntegratedCalendarWriteDraft {
  const foundation = prepareCalendarWriteDraft(message);

  if (!foundation.handled || !foundation.draft) {
    return {
      handled: false,
      readyForApproval: false,
      writeEnabled: false,
      text: "",
    };
  }

  const dateTime = parseCalendarDateTime(message);

  const draft = {
    id: foundation.draft.id,
    action: "create_event" as const,
    title: foundation.draft.title,
    start: dateTime.start,
    end: dateTime.end,
    dateLabel: dateTime.dateLabel,
    timeLabel: dateTime.timeLabel,
    durationMinutes: dateTime.durationMinutes,
    sourceMessage: message,
    requiresApproval: true as const,
    writeEnabled: false as const,
    status: "draft" as const,
    missing: dateTime.missing,
    confidence: dateTime.confidence,
  };

  if (!dateTime.ok) {
    const missingText = dateTime.missing
      .map((item) => (item === "date" ? "la date" : "l'heure"))
      .join(" et ");

    return {
      handled: true,
      readyForApproval: false,
      writeEnabled: false,
      draft,
      text:
        `J'ai préparé le brouillon "${draft.title}", mais il me manque ${missingText}. ` +
        "Je ne demanderai aucune validation et je n'écrirai rien dans Google Calendar tant que ces informations ne seront pas complètes.",
    };
  }

  return {
    handled: true,
    readyForApproval: true,
    writeEnabled: false,
    draft,
    text:
      `Brouillon prêt : "${draft.title}", ${draft.dateLabel} à ${draft.timeLabel}, ` +
      `durée ${draft.durationMinutes} minutes. ` +
      "Aucune écriture Google Calendar n'a été effectuée. Une validation explicite sera obligatoire avant toute future création.",
  };
}
