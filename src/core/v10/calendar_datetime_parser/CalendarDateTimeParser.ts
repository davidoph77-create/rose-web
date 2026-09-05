import type {
  CalendarDateTimeParseResult,
  CalendarDateTimeParserOptions,
} from "./CalendarDateTimeTypes";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const WEEKDAYS: Record<string, number> = {
  dimanche: 0,
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function nextWeekday(now: Date, targetDay: number, forceNextWeek = false) {
  const base = startOfDay(now);
  const currentDay = base.getDay();

  let delta = (targetDay - currentDay + 7) % 7;
  if (delta === 0) delta = 7;
  if (forceNextWeek) delta += 7;

  base.setDate(base.getDate() + delta);
  return base;
}

function parseDate(text: string, now: Date) {
  if (text.includes("aujourd hui")) {
    return { date: startOfDay(now), label: "aujourd'hui", confidence: 1 };
  }

  if (text.includes("demain")) {
    const d = startOfDay(now);
    d.setDate(d.getDate() + 1);
    return { date: d, label: "demain", confidence: 1 };
  }

  if (text.includes("apres demain")) {
    const d = startOfDay(now);
    d.setDate(d.getDate() + 2);
    return { date: d, label: "après-demain", confidence: 1 };
  }

  for (const [name, weekday] of Object.entries(WEEKDAYS)) {
    if (text.includes(name)) {
      const forceNextWeek =
        text.includes(`${name} prochain`) ||
        text.includes(`${name} prochaine`) ||
        text.includes("semaine prochaine");

      return {
        date: nextWeekday(now, weekday, forceNextWeek),
        label: forceNextWeek ? `${name} prochain` : name,
        confidence: 0.95,
      };
    }
  }

  const numeric = text.match(/\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]) - 1;
    let year = numeric[3] ? Number(numeric[3]) : now.getFullYear();

    if (year < 100) year += 2000;

    const d = new Date(year, month, day, 0, 0, 0, 0);

    if (!Number.isNaN(d.getTime())) {
      return {
        date: d,
        label: `${day}/${month + 1}/${year}`,
        confidence: 0.95,
      };
    }
  }

  return undefined;
}

function parseTime(text: string) {
  const hhmm = text.match(/\b(?:a|à)?\s*(\d{1,2})\s*(?:h|:)\s*(\d{2})\b/);
  if (hhmm) {
    const hour = Number(hhmm[1]);
    const minute = Number(hhmm[2]);

    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return {
        hour,
        minute,
        label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        confidence: 1,
      };
    }
  }

  const simpleHour = text.match(/\b(?:a|à)?\s*(\d{1,2})\s*h(?:eures?)?\b/);
  if (simpleHour) {
    const hour = Number(simpleHour[1]);

    if (hour >= 0 && hour <= 23) {
      return {
        hour,
        minute: 0,
        label: `${String(hour).padStart(2, "0")}:00`,
        confidence: 1,
      };
    }
  }

  if (text.includes("matin")) {
    return { hour: 9, minute: 0, label: "matin (09:00)", confidence: 0.65 };
  }

  if (text.includes("midi")) {
    return { hour: 12, minute: 0, label: "midi (12:00)", confidence: 0.85 };
  }

  if (text.includes("apres midi")) {
    return { hour: 15, minute: 0, label: "après-midi (15:00)", confidence: 0.65 };
  }

  if (text.includes("soir")) {
    return { hour: 19, minute: 0, label: "soir (19:00)", confidence: 0.65 };
  }

  return undefined;
}

function parseDurationMinutes(text: string, fallback: number) {
  const hours = text.match(/\bpendant\s+(\d{1,2})\s*h(?:eures?)?\b/);
  if (hours) {
    return Math.max(15, Math.min(Number(hours[1]) * 60, 24 * 60));
  }

  const minutes = text.match(/\bpendant\s+(\d{1,3})\s*min(?:utes?)?\b/);
  if (minutes) {
    return Math.max(15, Math.min(Number(minutes[1]), 24 * 60));
  }

  return fallback;
}

export function parseCalendarDateTime(
  sourceText: string,
  options: CalendarDateTimeParserOptions = {}
): CalendarDateTimeParseResult {
  const now = options.now ? new Date(options.now) : new Date();
  const defaultDurationMinutes = options.defaultDurationMinutes ?? 60;
  const text = normalizeText(sourceText);

  const dateInfo = parseDate(text, now);
  const timeInfo = parseTime(text);
  const durationMinutes = parseDurationMinutes(text, defaultDurationMinutes);

  const missing: Array<"date" | "time"> = [];
  if (!dateInfo) missing.push("date");
  if (!timeInfo) missing.push("time");

  if (!dateInfo || !timeInfo) {
    return {
      ok: false,
      sourceText,
      dateLabel: dateInfo?.label,
      timeLabel: timeInfo?.label,
      durationMinutes,
      confidence:
        ((dateInfo?.confidence ?? 0) + (timeInfo?.confidence ?? 0)) / 2,
      missing,
      readOnlySafe: true,
      writeEnabled: false,
    };
  }

  const start = new Date(dateInfo.date);
  start.setHours(timeInfo.hour, timeInfo.minute, 0, 0);

  const end = new Date(start.getTime() + durationMinutes * 60_000);

  return {
    ok: true,
    sourceText,
    start: start.toISOString(),
    end: end.toISOString(),
    dateLabel: dateInfo.label,
    timeLabel: timeInfo.label,
    durationMinutes,
    confidence: Math.min(dateInfo.confidence, timeInfo.confidence),
    missing,
    readOnlySafe: true,
    writeEnabled: false,
  };
}
