export type RoseCalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end?: string;
  location?: string;
  htmlLink?: string;
  allDay?: boolean;
};

export type CalendarReadResult = {
  ok: boolean;
  events: RoseCalendarEvent[];
  error?: string;
  readOnly: true;
  refreshedToken?: boolean;
};
