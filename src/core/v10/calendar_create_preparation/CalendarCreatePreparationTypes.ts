export type GoogleCalendarDateTime = {
  dateTime: string;
  timeZone: "Europe/Paris";
};

export type GoogleCalendarCreatePayload = {
  summary: string;
  start: GoogleCalendarDateTime;
  end: GoogleCalendarDateTime;
  location?: string;
};

export type CalendarCreatePreparationResult = {
  ok: boolean;
  payload?: GoogleCalendarCreatePayload;
  errors: string[];
  warnings: string[];
  executionEnabled: false;
  requiresExplicitApproval: true;
};
