// V10-044D4 - Calendar Intelligence READ ONLY
export type CalendarIntelligencePeriod = "today" | "tomorrow" | "this-week" | "next-event";
export type CalendarIntelligenceItem = {
  id: string; title: string; start: string; end?: string; location?: string;
  sourceCalendarId?: string; sourceCalendarName?: string; readOnly: true;
};
export type CalendarIntelligenceResult = {
  ok: boolean; period: CalendarIntelligencePeriod; generatedAt: string;
  items: CalendarIntelligenceItem[]; summary: string; readOnly: true; error?: string;
};
