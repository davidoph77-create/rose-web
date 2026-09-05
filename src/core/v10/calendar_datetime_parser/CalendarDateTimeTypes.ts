export type CalendarDateTimeParseResult = {
  ok: boolean;
  sourceText: string;
  start?: string;
  end?: string;
  dateLabel?: string;
  timeLabel?: string;
  durationMinutes?: number;
  confidence: number;
  missing: Array<"date" | "time">;
  readOnlySafe: true;
  writeEnabled: false;
};

export type CalendarDateTimeParserOptions = {
  now?: Date;
  defaultDurationMinutes?: number;
};
