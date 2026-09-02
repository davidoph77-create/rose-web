export type CalendarQuestionIntent =
  | "calendar_today"
  | "calendar_tomorrow"
  | "calendar_week"
  | "calendar_next"
  | "calendar_upcoming"
  | "not_calendar";

export type CalendarQuestionAnswer = {
  handled: boolean;
  intent: CalendarQuestionIntent;
  text: string;
  eventCount: number;
};
