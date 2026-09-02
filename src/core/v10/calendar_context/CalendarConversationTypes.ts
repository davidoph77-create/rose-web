export type CalendarContextWindow = "today" | "tomorrow" | "week" | "next" | "custom";

export type CalendarContextEvent = {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  location?: string;
  description?: string;
};

export type CalendarConversationSnapshot = {
  window: CalendarContextWindow;
  query: string;
  events: CalendarContextEvent[];
  selectedIndex: number | null;
  updatedAt: number;
};

export type CalendarFollowUpIntent =
  | "next"
  | "first"
  | "time"
  | "location"
  | "summary"
  | "unknown";
