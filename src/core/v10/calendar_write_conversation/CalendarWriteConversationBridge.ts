export type CalendarWriteDraft = {
  title: string;
  originalMessage: string;
  dateHint?: string;
  timeHint?: string;
  status: "draft";
  approvalRequired: true;
  executable: false;
  readOnlySafety: true;
};

export type CalendarWriteConversationResult = {
  handled: boolean;
  kind: "calendar-write-draft" | "not-calendar-write";
  text: string;
  draft?: CalendarWriteDraft;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const WRITE_WORDS = [
  "ajoute", "ajouter", "cree", "creer", "planifie", "planifier",
  "programme", "programmer", "mets", "mettre", "note", "noter"
];

const CALENDAR_WORDS = [
  "rendez vous", "rdv", "agenda", "calendrier", "calendar",
  "reunion", "meeting", "evenement", "rappel"
];

const READ_WORDS = [
  "quels sont", "quel est", "combien", "a quelle heure", "ou est",
  "montre", "affiche", "liste", "mes rendez vous", "mon agenda"
];

function looksLikeWrite(message: string) {
  const n = normalize(message);

  const hasWrite = WRITE_WORDS.some((x) => n.includes(x));
  const hasCalendar = CALENDAR_WORDS.some((x) => n.includes(x));
  const hasRead = READ_WORDS.some((x) => n.includes(x));

  return hasWrite && hasCalendar && !hasRead;
}

function extractTime(message: string) {
  const n = normalize(message);

  const hhmm = n.match(/\b(?:a\s*)?(\d{1,2})\s*(?:h|:)\s*(\d{2})\b/);
  if (hhmm) {
    const hh = String(Number(hhmm[1])).padStart(2, "0");
    const mm = String(Number(hhmm[2])).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  const hourOnly = n.match(/\b(?:a\s*)?(\d{1,2})\s*h\b/);
  if (hourOnly) {
    const hh = String(Number(hourOnly[1])).padStart(2, "0");
    return `${hh}:00`;
  }

  return undefined;
}

function extractDateHint(message: string) {
  const n = normalize(message);
  const patterns = [
    "aujourd hui", "demain", "apres demain",
    "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"
  ];

  const day = patterns.find((x) => n.includes(x));
  if (!day) return undefined;

  const next =
    n.includes(`${day} prochain`) ||
    n.includes(`${day} prochaine`) ||
    n.includes("semaine prochaine");

  return next ? `${day} prochain` : day;
}

function extractTitle(message: string) {
  let title = message.trim()
    .replace(/^(ajoute|ajouter|crée|cree|créer|creer|planifie|planifier|programme|programmer|mets|mettre|note|noter)\s+/i, "")
    .replace(/^(un|une)\s+/i, "")
    .replace(/\s+(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|demain|aujourd'hui|aujourd’hui)\b.*$/i, "")
    .trim();

  if (!title) title = "Rendez-vous";
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function prepareControlledCalendarWrite(
  message: string
): CalendarWriteConversationResult {
  if (!looksLikeWrite(message)) {
    return {
      handled: false,
      kind: "not-calendar-write",
      text: "",
    };
  }

  const draft: CalendarWriteDraft = {
    title: extractTitle(message),
    originalMessage: message,
    dateHint: extractDateHint(message),
    timeHint: extractTime(message),
    status: "draft",
    approvalRequired: true,
    executable: false,
    readOnlySafety: true,
  };

  const missing: string[] = [];
  if (!draft.dateHint) missing.push("la date");
  if (!draft.timeHint) missing.push("l'heure");

  if (missing.length > 0) {
    return {
      handled: true,
      kind: "calendar-write-draft",
      draft,
      text:
        `J'ai préparé un brouillon pour « ${draft.title} », mais il manque ${missing.join(" et ")}. ` +
        "Aucun événement Google Calendar n'a été créé.",
    };
  }

  return {
    handled: true,
    kind: "calendar-write-draft",
    draft,
    text:
      `Brouillon préparé : « ${draft.title} », ${draft.dateHint} à ${draft.timeHint}. ` +
      "Validation obligatoire. À cette étape, aucune écriture Google Calendar n'est autorisée et aucun événement n'a été créé.",
  };
}
