import { GoogleSignin } from "@react-native-google-signin/google-signin";
import type { CalendarUpdateDraft } from "../calendar_update_foundation";

export type ResolvedCalendarEvent = {
  id: string;
  summary: string;
  start?: string;
  end?: string;
  location?: string;
  htmlLink?: string;
};

export type CalendarEventResolveResult = {
  ok: boolean;
  resolved: boolean;
  event?: ResolvedCalendarEvent;
  candidates: ResolvedCalendarEvent[];
  confidence: number;
  text: string;
  error?: string;
  readOnly: true;
};

function normalize(input: string) {
  return (input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9:\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function eventStart(item: any): string | undefined {
  return item?.start?.dateTime || item?.start?.date;
}

function parseHour(value?: string): number | undefined {
  if (!value) return undefined;
  const m = value.match(/(\d{1,2})(?:\s*(?:h|:)\s*(\d{1,2}))?/i);
  if (!m) return undefined;
  return Number(m[1]) * 60 + Number(m[2] || 0);
}

function localMinutes(iso?: string): number | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.getHours() * 60 + d.getMinutes();
}

const DAY_NAMES = [
  ["dimanche", 0], ["lundi", 1], ["mardi", 2], ["mercredi", 3],
  ["jeudi", 4], ["vendredi", 5], ["samedi", 6],
] as const;

function requestedWeekday(message: string): number | undefined {
  const n = normalize(message);
  for (const [name, day] of DAY_NAMES) {
    if (n.includes(name)) return day;
  }
  return undefined;
}

function cleanTargetWords(input: string): string[] {
  const stop = new Set([
    "mon","ma","mes","le","la","les","un","une","des","du","de","chez","rendez-vous",
    "rendez","vous","rdv","agenda","calendrier","samedi","dimanche","lundi","mardi",
    "mercredi","jeudi","vendredi","a","à","vers","heure"
  ]);
  return normalize(input)
    .split(" ")
    .filter(w => w.length >= 2 && !stop.has(w) && !/^\d+$/.test(w));
}

function scoreEvent(item: any, draft: CalendarUpdateDraft) {
  const summary = normalize(item?.summary || "");
  const targetWords = cleanTargetWords(draft.targetHint || draft.originalMessage);
  let score = 0;

  for (const word of targetWords) {
    if (summary.includes(word)) score += word.length >= 5 ? 18 : 10;
  }

  const requestedDay = requestedWeekday(draft.originalMessage);
  const start = eventStart(item);
  if (requestedDay !== undefined && start) {
    const d = new Date(start);
    if (!Number.isNaN(d.getTime()) && d.getDay() === requestedDay) score += 30;
    else score -= 12;
  }

  const oldMinutes = parseHour(draft.oldTime);
  const actualMinutes = localMinutes(start);
  if (oldMinutes !== undefined && actualMinutes !== undefined) {
    const delta = Math.abs(oldMinutes - actualMinutes);
    if (delta === 0) score += 40;
    else if (delta <= 15) score += 25;
    else if (delta <= 60) score += 8;
    else score -= 8;
  }

  return score;
}

function toResolved(item: any): ResolvedCalendarEvent {
  return {
    id: String(item?.id || ""),
    summary: String(item?.summary || "(sans titre)"),
    start: eventStart(item),
    end: item?.end?.dateTime || item?.end?.date,
    location: item?.location,
    htmlLink: item?.htmlLink,
  };
}

export async function resolveGoogleCalendarEventForUpdate(
  draft: CalendarUpdateDraft
): Promise<CalendarEventResolveResult> {
  try {
    const signedIn = await GoogleSignin.hasPreviousSignIn();
    if (!signedIn) {
      return {
        ok: false, resolved: false, candidates: [], confidence: 0, readOnly: true,
        text: "Google Calendar n’est pas connecté. Aucune modification n’a été exécutée.",
        error: "Google Calendar is not connected.",
      };
    }

    const tokens = await GoogleSignin.getTokens();
    const accessToken = tokens?.accessToken;
    if (!accessToken) {
      return {
        ok: false, resolved: false, candidates: [], confidence: 0, readOnly: true,
        text: "Le jeton Google Calendar est indisponible. Aucune modification n’a été exécutée.",
        error: "No Google access token available.",
      };
    }

    const now = new Date();
    const timeMin = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "50",
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    console.log(`[Rose V10-043B] EVENT RESOLVER HTTP / status=${response.status} / ok=${response.ok}`);

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false, resolved: false, candidates: [], confidence: 0, readOnly: true,
        text: "Je n’ai pas pu consulter Google Calendar pour identifier le rendez-vous. Aucune modification n’a été exécutée.",
        error: `Google Calendar GET failed (${response.status}): ${body.slice(0, 300)}`,
      };
    }

    const data = await response.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    const ranked = items
      .map((item: any) => ({ item, score: scoreEvent(item, draft) }))
      .filter((x: any) => x.score > 0)
      .sort((a: any, b: any) => b.score - a.score);

    const candidates = ranked.slice(0, 3).map((x: any) => toResolved(x.item));
    const best = ranked[0];
    const second = ranked[1];
    const confidence = best ? best.score : 0;

    // Require a meaningful match and enough separation from the second candidate.
    const uniqueEnough = !!best && (!second || best.score - second.score >= 12);
    const resolved = !!best && best.score >= 40 && uniqueEnough;

    console.log(
      `[Rose V10-043B] EVENT RESOLVER / scanned=${items.length} / matches=${ranked.length} / bestScore=${best?.score ?? 0} / resolved=${resolved}`
    );

    if (!resolved) {
      const names = candidates.map(c => `"${c.summary}"`).join(", ");
      return {
        ok: true,
        resolved: false,
        candidates,
        confidence,
        readOnly: true,
        text: candidates.length
          ? `J’ai trouvé plusieurs rendez-vous possibles dans Google Calendar (${names}), mais je ne peux pas identifier le bon avec assez de certitude. Aucune modification n’a été exécutée.`
          : "Je n’ai trouvé aucun rendez-vous Google Calendar correspondant avec assez de certitude. Aucune modification n’a été exécutée.",
      };
    }

    const event = toResolved(best.item);
    const startText = event.start
      ? new Date(event.start).toLocaleString("fr-FR")
      : "heure inconnue";

    return {
      ok: true,
      resolved: true,
      event,
      candidates,
      confidence,
      readOnly: true,
      text:
        `J’ai identifié le rendez-vous réel dans Google Calendar : « ${event.summary} », prévu le ${startText}. ` +
        `Son identifiant est ${event.id}. La modification demandée (${draft.requestedChange}) reste en brouillon : ` +
        "aucun PATCH, PUT ou DELETE n’a été envoyé à Google Calendar.",
    };
  } catch (error: any) {
    return {
      ok: false, resolved: false, candidates: [], confidence: 0, readOnly: true,
      text: "Une erreur est survenue pendant l’identification du rendez-vous. Aucune modification n’a été exécutée.",
      error: error?.message || String(error),
    };
  }
}
